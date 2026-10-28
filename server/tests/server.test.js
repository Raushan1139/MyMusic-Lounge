const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const { extractYouTubeVideoId, normalizeYouTubeTrack } = require('../src/utils/youtube');

describe('MyMusic Lounge Server Tests', () => {
  it('GET /api/health should return status healthy', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
    assert.strictEqual(res.body.service, 'MyMusic Lounge API');
  });

  describe('YouTube Parser & Normalizer', () => {
    it('should correctly parse standard youtube watch URLs', () => {
      const id = extractYouTubeVideoId('https://www.youtube.com/watch?v=jfKfPfyJRdk');
      assert.strictEqual(id, 'jfKfPfyJRdk');
    });

    it('should correctly parse youtu.be short URLs', () => {
      const id = extractYouTubeVideoId('https://youtu.be/4xDzrJKXOOY');
      assert.strictEqual(id, '4xDzrJKXOOY');
    });

    it('should correctly parse shorts URLs', () => {
      const id = extractYouTubeVideoId('https://www.youtube.com/shorts/DWcJFNfaw9c');
      assert.strictEqual(id, 'DWcJFNfaw9c');
    });

    it('should correctly parse direct 11-char video ID', () => {
      const id = extractYouTubeVideoId('5yx6BWlEVcY');
      assert.strictEqual(id, '5yx6BWlEVcY');
    });

    it('should return null for invalid URLs', () => {
      const id = extractYouTubeVideoId('https://google.com/search?q=music');
      assert.strictEqual(id, null);
    });

    it('should produce normalized track payload', () => {
      const norm = normalizeYouTubeTrack('https://youtu.be/jfKfPfyJRdk');
      assert.strictEqual(norm.provider, 'youtube');
      assert.strictEqual(norm.providerVideoId, 'jfKfPfyJRdk');
      assert.strictEqual(norm.watchUrl, 'https://www.youtube.com/watch?v=jfKfPfyJRdk');
      assert.ok(norm.thumbnailUrl.includes('jfKfPfyJRdk'));
    });
  });

  describe('Authentication & RBAC', () => {
    const testUsername = `user_${Date.now()}`;
    const testEmail = `${testUsername}@test.com`;
    let userToken = '';

    it('should register a new listener', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: testUsername,
        email: testEmail,
        password: 'Password123!',
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.token);
      assert.strictEqual(res.body.user.username, testUsername);
      userToken = res.body.token;
    });

    it('should reject duplicate registration', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: testUsername,
        email: testEmail,
        password: 'Password123!',
      });
      assert.strictEqual(res.status, 409);
    });

    it('should login an existing listener', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: testEmail,
        password: 'Password123!',
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.token);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: testEmail,
        password: 'WrongPassword!',
      });
      assert.strictEqual(res.status, 401);
    });

    it('should deny non-admin access to admin station endpoints', async () => {
      const res = await request(app)
        .patch('/api/station/admin')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ action: 'play' });
      assert.strictEqual(res.status, 403);
    });

    it('should allow admin login and station control', async () => {
      const adminLogin = await request(app).post('/api/auth/login').send({
        identifier: 'admin@mymusiclounge.com',
        password: 'AdminLounge2026!',
      });
      assert.strictEqual(adminLogin.status, 200);
      assert.strictEqual(adminLogin.body.user.role, 'ADMIN');

      const adminToken = adminLogin.body.token;
      const res = await request(app)
        .patch('/api/station/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'play' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });
  });

  describe('Catalog & Playlists', () => {
    it('GET /api/tracks should return published tracks', async () => {
      const res = await request(app).get('/api/tracks');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.tracks));
      assert.ok(res.body.tracks.length > 0);
    });

    it('GET /api/playlists should return public playlists', async () => {
      const res = await request(app).get('/api/playlists');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.playlists));
      assert.ok(res.body.playlists.length > 0);
    });

    it('GET /api/station should return station state and presence', async () => {
      const res = await request(app).get('/api/station');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.station);
      assert.ok(res.body.station.name);
      assert.strictEqual(typeof res.body.station.listenerCount, 'number');
    });

    it('GET /api/settings/public should return site branding and hero info', async () => {
      const res = await request(app).get('/api/settings/public');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.settings.site_name, 'MyMusic Lounge');
    });
  });
});
