const bcrypt = require('bcryptjs');
const { connectDB, mongoose } = require('./config/db');
const { User, Track, Playlist, Station, AppSetting, Favorite } = require('./models');

async function seed() {
  console.log('--- Starting MyMusic Lounge MongoDB Database Seed ---');
  await connectDB();

  // 1. Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mymusiclounge.com';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminLounge2026!';

  let admin = await User.findOne({
    $or: [{ email: adminEmail }, { username: adminUsername }],
  });

  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await User.create({
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
    console.log(`Created admin user: ${admin.email}`);
  } else {
    console.log(`Admin user exists: ${admin.email}`);
  }

  // Demo regular user (AlexLounge)
  const demoEmail = 'listener@mymusiclounge.com';
  let demoUser = await User.findOne({ email: demoEmail });
  if (!demoUser) {
    const userPass = await bcrypt.hash('Listener123!', 10);
    demoUser = await User.create({
      username: 'AlexLounge',
      email: demoEmail,
      passwordHash: userPass,
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });
    console.log('Created demo listener user');
  }

  // Raushan User
  const raushanEmail = 'raushan113925@gmail.com';
  let raushanUser = await User.findOne({ email: raushanEmail });
  if (!raushanUser) {
    raushanUser = await User.create({
      username: 'Raushan',
      email: raushanEmail,
      passwordHash: '$2a$10$vFY9yDtQr8sxuNbmzkoTm.5uUCWQY3jG2onC3IRNyUX1oQkATbDEi',
      role: 'USER',
      avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=Raushan',
    });
    console.log('Restored user account: Raushan');
  }

  // 2. All Catalog Tracks (Lounge tracks + User custom added tracks)
  const tracksData = [
    // Lounge Originals
    {
      title: 'Lofi Hip Hop - Chill Beats',
      artist: 'Lofi Lounge Sessions',
      album: 'Midnight Coffee',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
      provider: 'youtube',
      providerVideoId: 'jfKfPfyJRdk',
      durationSeconds: 240,
      isPublished: true,
    },
    {
      title: 'Midnight Drive Synthwave',
      artist: 'Neon Horizon',
      album: 'Cyber Dreams',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      provider: 'youtube',
      providerVideoId: '4xDzrJKXOOY',
      durationSeconds: 310,
      isPublished: true,
    },
    {
      title: 'Deep Focus Ambient Flow',
      artist: 'Cerebral Resonance',
      album: 'Zero Distraction',
      thumbnailUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80',
      provider: 'youtube',
      providerVideoId: 'DWcJFNfaw9c',
      durationSeconds: 280,
      isPublished: true,
    },
    {
      title: 'Rainy Night In Tokyo',
      artist: 'Lo-Fi Melancholy',
      album: 'Monsoon Echoes',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      provider: 'youtube',
      providerVideoId: '5yx6BWlEVcY',
      durationSeconds: 260,
      isPublished: true,
    },
    {
      title: 'Coffee Shop Warm Acoustics',
      artist: 'Velvet Strings',
      album: 'Espresso Diaries',
      thumbnailUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80',
      provider: 'youtube',
      providerVideoId: 'e3L1I71845o',
      durationSeconds: 215,
      isPublished: true,
    },
    {
      title: 'Evening Smooth Jazz Lounge',
      artist: 'The Delux Quartet',
      album: 'Golden Hour Soiree',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
      provider: 'youtube',
      providerVideoId: 'Dx5qFachd3A',
      durationSeconds: 345,
      isPublished: true,
    },
    {
      title: 'Electric Euphoria Workout',
      artist: 'Pulse Architect',
      album: 'High Cadence',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&auto=format&fit=crop&q=80',
      provider: 'youtube',
      providerVideoId: 'b1kbLwvqugk',
      durationSeconds: 230,
      isPublished: true,
    },
    {
      title: 'Sunset Whispers & Soft Chords',
      artist: 'Aura Bloom',
      album: 'Twilight Breeze',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      provider: 'youtube',
      providerVideoId: 'lTRiuFIWV54',
      durationSeconds: 290,
      isPublished: true,
    },

    // User's Added Masterpieces
    {
      title: 'Pyar ki Raah',
      artist: 'Ankita',
      album: 'Gazal',
      thumbnailUrl: 'https://img.youtube.com/vi/8-e9YsRyxJY/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: '8-e9YsRyxJY',
      durationSeconds: 180,
      isPublished: true,
    },
    {
      title: 'Duniya Kisi Ke Pyar Mein',
      artist: 'Ustad Mehdi Hassan',
      album: null,
      thumbnailUrl: 'https://img.youtube.com/vi/mJYZjMgTn4A/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'mJYZjMgTn4A',
      durationSeconds: 180,
      isPublished: true,
    },
    {
      title: 'Khamosh Lab Hai Jhuki Hai Palkein',
      artist: 'Mehdi Hasan sahab',
      album: null,
      thumbnailUrl: 'https://img.youtube.com/vi/z3uynSFb1VM/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'z3uynSFb1VM',
      durationSeconds: 180,
      isPublished: true,
    },
    {
      title: 'Ham Tere Sahar me',
      artist: 'Ghulam Ali',
      album: null,
      thumbnailUrl: 'https://img.youtube.com/vi/7yLBNUKqbLs/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: '7yLBNUKqbLs',
      durationSeconds: 180,
      isPublished: true,
    },
    {
      title: 'Ham ko kiske Gham ne mara',
      artist: 'Ghulam Ali Ghazal',
      album: null,
      thumbnailUrl: 'https://img.youtube.com/vi/LnVW-lYaRIs/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'LnVW-lYaRIs',
      durationSeconds: 180,
      isPublished: true,
    },
    {
      title: 'Kal Chaudhvin Ki Raat Thi',
      artist: 'Jagjit Singh',
      album: null,
      thumbnailUrl: 'https://img.youtube.com/vi/dN1O1vQju2Q/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'dN1O1vQju2Q',
      durationSeconds: 180,
      isPublished: true,
    },
    {
      title: 'Humein To Matlab Hai Sirf Tumse',
      artist: 'Ankita',
      album: null,
      thumbnailUrl: 'https://img.youtube.com/vi/iaUYQ7PZWBc/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'iaUYQ7PZWBc',
      durationSeconds: 180,
      isPublished: true,
    },
    {
      title: 'Hothon Se Chhu Lo Tum',
      artist: 'Jagjit Singh',
      album: null,
      thumbnailUrl: 'https://img.youtube.com/vi/mBZBK09dlyk/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'mBZBK09dlyk',
      durationSeconds: 180,
      isPublished: true,
    },
    {
      title: 'Chupke Chupke Raat Din Aansoon Bahana Yaad Hai',
      artist: 'Ghulam Ali Ghazals',
      album: null,
      thumbnailUrl: 'https://img.youtube.com/vi/MWjaK_nW72E/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'MWjaK_nW72E',
      durationSeconds: 180,
      isPublished: true,
    },
    {
      title: 'Yeh Jo Halka Halka Suroor Hai',
      artist: 'Nusrat Fateh Ali Khan',
      album: null,
      thumbnailUrl: 'https://img.youtube.com/vi/D8l3fLJ1Klw/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'D8l3fLJ1Klw',
      durationSeconds: 180,
      isPublished: true,
    },
  ];

  const seededTracks = [];
  for (const t of tracksData) {
    let existing = await Track.findOne({
      provider: t.provider,
      providerVideoId: t.providerVideoId,
    });
    if (!existing) {
      existing = await Track.create(t);
    }
    seededTracks.push(existing);
  }
  console.log(`Seeded ${seededTracks.length} catalog tracks into MongoDB`);

  // 3. Playlists (Curated + "My Favourite")
  const samplePlaylists = [
    {
      name: 'Chill & Relax',
      description: 'Mellow soothing frequencies designed for unwinding after hours.',
      coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
      trackIndices: [0, 3, 4, 7],
    },
    {
      name: 'Coding Focus',
      description: 'Unobtrusive instrumental rhythms tuned for deep programming and problem solving.',
      coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80',
      trackIndices: [2, 0, 1, 4],
    },
    {
      name: 'Lo-Fi Sessions',
      description: 'Analog tape warmth, vinyl crackle, and laid-back beat craft.',
      coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      trackIndices: [0, 3, 7, 4],
    },
    {
      name: 'Romantic Collection',
      description: 'Intimate melodies and velvet harmonies for special moments.',
      coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
      trackIndices: [5, 4, 7],
    },
    {
      name: 'Workout Energy',
      description: 'Uplifting tempo and bass drivers to keep the adrenaline pumping.',
      coverUrl: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&auto=format&fit=crop&q=80',
      trackIndices: [6, 1],
    },
    {
      name: 'Night Drive',
      description: 'Synth-drenched nostalgia for neon highways and midnight skylines.',
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      trackIndices: [1, 2, 6],
    },
    {
      name: 'My Favourite',
      description: 'Timeless Ghazals & Soulful Masterpieces (Mehdi Hassan, Jagjit Singh, Ghulam Ali, Nusrat Fateh Ali Khan).',
      coverUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAJzHRj_LyldsPJn24kScZ93yNCBEeEANxDTzTr0EB4g&s=10',
      trackIndices: [9, 10, 11, 12, 13, 14, 15, 16, 17, 8],
    },
  ];

  let defaultPlaylist = null;

  for (const pl of samplePlaylists) {
    let existingPl = await Playlist.findOne({ name: pl.name });
    if (!existingPl) {
      const tracks = pl.trackIndices.map((idx, pos) => ({
        track: seededTracks[idx].id,
        position: pos,
        addedAt: new Date(),
      }));

      existingPl = await Playlist.create({
        name: pl.name,
        description: pl.description,
        coverUrl: pl.coverUrl,
        owner: admin.id,
        isPublic: true,
        isPublished: true,
        tracks,
      });
      console.log(`Created playlist in MongoDB: ${existingPl.name} (${tracks.length} tracks)`);
    }

    if (pl.name === 'Chill & Relax') {
      defaultPlaylist = existingPl;
    }
  }

  // 4. Station
  let station = await Station.findOne();
  if (!station) {
    const queue = seededTracks.slice(1, 5).map((t, idx) => ({
      track: t.id,
      position: idx,
      addedAt: new Date(),
    }));

    station = await Station.create({
      name: 'MyMusic Lounge Main Radio',
      description: 'Curated audio sanctuary broadcasting synchronized vibes to the lounge.',
      currentTrack: seededTracks[0]?.id,
      defaultPlaylist: defaultPlaylist?.id,
      playbackState: 'PLAYING',
      positionSeconds: 0,
      queue,
    });
    console.log(`Initialized Station in MongoDB: ${station.name}`);
  }

  // 5. App Settings
  const settings = [
    { key: 'site_name', value: 'MyMusic Lounge' },
    { key: 'site_tagline', value: 'Your Music. Your Mood. Your Space.' },
    { key: 'hero_title', value: 'Welcome to MyMusic Lounge' },
    { key: 'hero_subtitle', value: 'An immersive digital music lounge. Listen to our live owner-curated radio station or take the decks with your personal playlist.' },
    { key: 'chat_enabled', value: 'true' },
    { key: 'guest_access', value: 'true' },
    { key: 'theme_accent', value: '#8B5CF6' },
  ];

  for (const s of settings) {
    await AppSetting.findOneAndUpdate(
      { key: s.key },
      { key: s.key, value: s.value },
      { upsert: true, new: true }
    );
  }
  console.log('App settings seeded successfully into MongoDB');

  // 6. Demo user favorite
  if (demoUser && seededTracks[0]) {
    await Favorite.findOneAndUpdate(
      { user: demoUser.id, track: seededTracks[0].id },
      { user: demoUser.id, track: seededTracks[0].id, createdAt: new Date() },
      { upsert: true, new: true }
    );
  }

  console.log('--- MongoDB Database Seed Complete! ---');
}

if (require.main === module) {
  seed()
    .then(async () => {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
    })
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = seed;
