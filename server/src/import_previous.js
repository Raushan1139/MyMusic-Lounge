const fs = require('fs');
const path = require('path');
const { connectDB } = require('./config/db');
const { User, Track, Playlist, Station, Favorite } = require('./models');

async function importPreviousData() {
  console.log('--- Importing Previous Data into MongoDB ---');
  await connectDB();

  const dataPath = path.resolve(__dirname, '../previous_data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('previous_data.json not found!');
    return;
  }

  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // 1. Import Users
  const userMap = new Map(); // oldId -> new MongoDB User doc
  for (const u of raw.users) {
    let existing = await User.findOne({
      $or: [{ email: u.email.toLowerCase() }, { username: u.username }],
    });

    if (!existing) {
      existing = await User.create({
        username: u.username,
        email: u.email.toLowerCase(),
        passwordHash: u.passwordHash,
        role: u.role,
        avatarUrl: u.avatarUrl,
      });
      console.log(`Imported User: ${existing.username} (${existing.email})`);
    } else {
      console.log(`User already exists: ${existing.username} (${existing.email})`);
    }
    userMap.set(u.id, existing);
  }

  // Ensure admin is in userMap
  const adminUser = await User.findOne({ role: 'ADMIN' });

  // 2. Import Tracks
  const trackMap = new Map(); // oldId -> new MongoDB Track doc
  for (const t of raw.tracks) {
    let existing = await Track.findOne({
      provider: t.provider,
      providerVideoId: t.providerVideoId,
    });

    if (!existing) {
      existing = await Track.create({
        title: t.title,
        artist: t.artist,
        album: t.album,
        thumbnailUrl: t.thumbnailUrl,
        provider: t.provider,
        providerVideoId: t.providerVideoId,
        durationSeconds: t.durationSeconds,
        isPublished: t.isPublished,
      });
      console.log(`Imported Track: "${existing.title}" by ${existing.artist} (${existing.providerVideoId})`);
    } else {
      console.log(`Track already exists: "${existing.title}"`);
    }
    trackMap.set(t.id, existing);
  }

  // 3. Import Playlists
  for (const pl of raw.playlists) {
    let existingPl = await Playlist.findOne({ name: pl.name });
    const ownerDoc = userMap.get(pl.ownerId) || adminUser;

    const tracks = (pl.tracks || [])
      .map((pt, idx) => {
        const trackDoc = trackMap.get(pt.trackId) || trackMap.get(pt.track?.id);
        if (!trackDoc) return null;
        return {
          track: trackDoc.id,
          position: pt.position !== undefined ? pt.position : idx,
          addedAt: pt.addedAt ? new Date(pt.addedAt) : new Date(),
        };
      })
      .filter(Boolean);

    if (!existingPl) {
      existingPl = await Playlist.create({
        name: pl.name,
        description: pl.description,
        coverUrl: pl.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
        owner: ownerDoc ? ownerDoc.id : adminUser.id,
        isPublic: pl.isPublic !== false,
        isPublished: pl.isPublished !== false,
        tracks,
      });
      console.log(`Imported Playlist: "${existingPl.name}" with ${tracks.length} tracks.`);
    } else {
      // Update tracks if needed
      if ((existingPl.tracks || []).length < tracks.length) {
        await Playlist.findByIdAndUpdate(existingPl.id, { tracks });
        console.log(`Updated Playlist "${existingPl.name}" with ${tracks.length} tracks.`);
      }
    }
  }

  // Also ensure "My Favourite" is assigned or accessible to Raushan and Admin
  const raushanUser = await User.findOne({ username: 'Raushan' });
  if (raushanUser) {
    const myFavPl = await Playlist.findOne({ name: 'My Favourite' });
    if (myFavPl && myFavPl.owner.toString() !== raushanUser.id) {
      // Create a copy or assign to Raushan as well so Raushan sees it under "My Personal Playlists"
      const raushanFav = await Playlist.findOne({ name: 'My Favourite', owner: raushanUser.id });
      if (!raushanFav) {
        await Playlist.create({
          name: 'My Favourite',
          description: 'Personal favorites collection',
          coverUrl: myFavPl.coverUrl,
          owner: raushanUser.id,
          isPublic: true,
          isPublished: true,
          tracks: myFavPl.tracks,
        });
        console.log(`Created personal "My Favourite" playlist for user Raushan.`);
      }
    }
  }

  console.log('--- Previous Data Import Complete! ---');
}

if (require.main === module) {
  importPreviousData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = importPreviousData;
