const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting MyMusic Lounge Database Seed ---');

  // 1. Create or verify Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mymusiclounge.com';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminLounge2026!';

  let admin = await prisma.user.findFirst({
    where: { OR: [{ email: adminEmail }, { username: adminUsername }] },
  });

  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    });
    console.log(`Created admin user: ${admin.email}`);
  } else {
    console.log(`Admin user exists: ${admin.email}`);
  }

  // Also create a demo regular listener user
  const demoListenerEmail = 'listener@mymusiclounge.com';
  let demoUser = await prisma.user.findUnique({ where: { email: demoListenerEmail } });
  if (!demoUser) {
    const userPass = await bcrypt.hash('Listener123!', 10);
    demoUser = await prisma.user.create({
      data: {
        username: 'AlexLounge',
        email: demoListenerEmail,
        passwordHash: userPass,
        role: 'USER',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
    });
    console.log('Created demo listener user');
  }

  // 2. Demo Tracks (Real, public, embeddable YouTube music videos/tracks)
  const tracksData = [
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
  ];

  const seededTracks = [];
  for (const trackData of tracksData) {
    const existing = await prisma.track.findUnique({
      where: {
        provider_providerVideoId: {
          provider: trackData.provider,
          providerVideoId: trackData.providerVideoId,
        },
      },
    });

    if (existing) {
      seededTracks.push(existing);
    } else {
      const created = await prisma.track.create({ data: trackData });
      seededTracks.push(created);
    }
  }
  console.log(`Seeded ${seededTracks.length} catalog tracks`);

  // 3. Create Sample Playlists
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
  ];

  let defaultPlaylist = null;

  for (const pl of samplePlaylists) {
    let playlist = await prisma.playlist.findFirst({
      where: { name: pl.name, ownerId: admin.id },
    });

    if (!playlist) {
      playlist = await prisma.playlist.create({
        data: {
          name: pl.name,
          description: pl.description,
          coverUrl: pl.coverUrl,
          ownerId: admin.id,
          isPublic: true,
          isPublished: true,
        },
      });

      // Add tracks with position
      for (let i = 0; i < pl.trackIndices.length; i++) {
        const track = seededTracks[pl.trackIndices[i]];
        if (track) {
          await prisma.playlistTrack.create({
            data: {
              playlistId: playlist.id,
              trackId: track.id,
              position: i,
            },
          });
        }
      }
      console.log(`Created playlist: ${playlist.name}`);
    }

    if (pl.name === 'Chill & Relax') {
      defaultPlaylist = playlist;
    }
  }

  // 4. Create or Update Owner-Controlled Station
  let station = await prisma.station.findFirst();
  const firstTrack = seededTracks[0];

  if (!station) {
    station = await prisma.station.create({
      data: {
        name: 'MyMusic Lounge Main Radio',
        description: 'Curated audio sanctuary broadcasting synchronized vibes to the lounge.',
        currentTrackId: firstTrack?.id,
        defaultPlaylistId: defaultPlaylist?.id,
        playbackState: 'PLAYING',
        positionSeconds: 0,
      },
    });

    // Populate initial queue
    const queueTracks = seededTracks.slice(1, 5);
    for (let i = 0; i < queueTracks.length; i++) {
      await prisma.stationQueue.create({
        data: {
          stationId: station.id,
          trackId: queueTracks[i].id,
          position: i,
        },
      });
    }
    console.log(`Initialized Station: ${station.name}`);
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
    await prisma.appSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
  console.log('App settings seeded successfully');

  // 6. Demo user favorites
  if (demoUser && seededTracks[0]) {
    await prisma.favorite.upsert({
      where: {
        userId_trackId: {
          userId: demoUser.id,
          trackId: seededTracks[0].id,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        trackId: seededTracks[0].id,
      },
    });
  }

  console.log('--- Database Seed Complete! ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
