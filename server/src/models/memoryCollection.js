const mongoose = require('mongoose');

class MemoryQuery {
  constructor(items, isSingle = false) {
    this.items = [...items];
    this.isSingle = isSingle;
    this._skip = 0;
    this._limit = null;
    this._sort = null;
    this._populateFields = [];
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  skip(n) {
    this._skip = parseInt(n, 10) || 0;
    return this;
  }

  limit(n) {
    this._limit = parseInt(n, 10);
    return this;
  }

  populate(field) {
    this._populateFields.push(field);
    return this;
  }

  select() {
    return this;
  }

  async exec() {
    let result = [...this.items];

    if (this._sort) {
      const [key, dir] = Object.entries(this._sort)[0] || [];
      if (key) {
        const factor = dir === -1 || dir === 'desc' ? -1 : 1;
        result.sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA instanceof Date && valB instanceof Date) {
            return (valA.getTime() - valB.getTime()) * factor;
          }
          if (valA > valB) return 1 * factor;
          if (valA < valB) return -1 * factor;
          return 0;
        });
      }
    }

    if (this._skip > 0) {
      result = result.slice(this._skip);
    }

    if (this._limit !== null && this._limit >= 0) {
      result = result.slice(0, this._limit);
    }

    if (this.isSingle) {
      return result.length > 0 ? result[0] : null;
    }

    return result;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.documents = new Map();
  }

  _generateId() {
    return new mongoose.Types.ObjectId().toString();
  }

  _matches(doc, query = {}) {
    if (!query || Object.keys(query).length === 0) return true;

    for (const [key, expected] of Object.entries(query)) {
      if (key === '$or' && Array.isArray(expected)) {
        const anyMatch = expected.some((subQuery) => this._matches(doc, subQuery));
        if (!anyMatch) return false;
        continue;
      }

      if (key === '_id' || key === 'id') {
        const idStr = expected?.toString ? expected.toString() : expected;
        if (doc._id.toString() !== idStr && doc.id !== idStr) {
          return false;
        }
        continue;
      }

      const val = doc[key];

      if (expected && typeof expected === 'object' && !(expected instanceof Date)) {
        if (expected.$regex) {
          const regex = new RegExp(expected.$regex, expected.$options || 'i');
          if (!regex.test(String(val || ''))) return false;
          continue;
        }
        if (expected.$ne !== undefined) {
          if (val === expected.$ne) return false;
          continue;
        }
        if (expected.$in && Array.isArray(expected.$in)) {
          const valStr = val?.toString ? val.toString() : val;
          const match = expected.$in.some((item) => item.toString() === valStr);
          if (!match) return false;
          continue;
        }
      }

      if (val instanceof Date && expected instanceof Date) {
        if (val.getTime() !== expected.getTime()) return false;
        continue;
      }

      if (val?.toString && expected?.toString && (val?.constructor?.name === 'ObjectId' || expected?.constructor?.name === 'ObjectId')) {
        if (val.toString() !== expected.toString()) return false;
        continue;
      }

      if (val !== expected) {
        return false;
      }
    }

    return true;
  }

  _formatDoc(data) {
    const id = data._id ? data._id.toString() : (data.id || this._generateId());
    const doc = {
      ...data,
      _id: id,
      id,
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date(),
      toJSON() {
        const copy = { ...this };
        delete copy.__v;
        return copy;
      },
      toObject() {
        const copy = { ...this };
        delete copy.__v;
        return copy;
      },
    };
    return doc;
  }

  find(query = {}) {
    const matched = [];
    for (const doc of this.documents.values()) {
      if (this._matches(doc, query)) {
        matched.push(doc);
      }
    }
    return new MemoryQuery(matched, false);
  }

  findOne(query = {}) {
    const matched = [];
    for (const doc of this.documents.values()) {
      if (this._matches(doc, query)) {
        matched.push(doc);
        break;
      }
    }
    return new MemoryQuery(matched, true);
  }

  findById(id) {
    if (!id) return new MemoryQuery([], true);
    const idStr = id.toString();
    const doc = this.documents.get(idStr);
    return new MemoryQuery(doc ? [doc] : [], true);
  }

  async create(data) {
    const formatted = this._formatDoc(data);
    this.documents.set(formatted.id, formatted);
    return formatted;
  }

  async findByIdAndUpdate(id, update = {}, options = {}) {
    if (!id) return null;
    const idStr = id.toString();
    let doc = this.documents.get(idStr);

    if (!doc) {
      if (options.upsert) {
        return await this.create({ _id: idStr, ...update });
      }
      return null;
    }

    const updated = {
      ...doc,
      ...update,
      updatedAt: new Date(),
    };
    this.documents.set(idStr, updated);
    return updated;
  }

  async findOneAndUpdate(query = {}, update = {}, options = {}) {
    let doc = await this.findOne(query).exec();

    if (!doc) {
      if (options.upsert) {
        return await this.create({ ...query, ...update });
      }
      return null;
    }

    const idStr = doc.id;
    const updated = {
      ...doc,
      ...update,
      updatedAt: new Date(),
    };
    this.documents.set(idStr, updated);
    return updated;
  }

  async findByIdAndDelete(id) {
    if (!id) return null;
    const idStr = id.toString();
    const existing = this.documents.get(idStr);
    this.documents.delete(idStr);
    return existing || null;
  }

  async deleteOne(query = {}) {
    const doc = await this.findOne(query).exec();
    if (doc) {
      this.documents.delete(doc.id);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async deleteMany(query = {}) {
    let count = 0;
    for (const [id, doc] of this.documents.entries()) {
      if (this._matches(doc, query)) {
        this.documents.delete(id);
        count++;
      }
    }
    return { deletedCount: count };
  }

  async countDocuments(query = {}) {
    let count = 0;
    for (const doc of this.documents.values()) {
      if (this._matches(doc, query)) count++;
    }
    return count;
  }

  async clear() {
    this.documents.clear();
  }
}

module.exports = MemoryCollection;
