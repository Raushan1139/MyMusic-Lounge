/**
 * Extra seed script: Add more 90s Bollywood songs to "Old Song" playlist
 * YouTube mix: RDjD3SGW0NHY0 (seeded from Chand Se Parda Kijiye)
 * Run: node server/seed-old-songs-extra.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { connectDB, mongoose } = require('./src/config/db');
const { Track, Playlist } = require('./src/models');

const newOldSongs = [
  // ── Kumar Sanu classics ──────────────────────────────────────────────
  {
    title: 'Mera Dil Bhi Kitna Pagal Hai',
    artist: 'Kumar Sanu & Alka Yagnik',
    album: 'Saajan',
    thumbnailUrl: 'https://i.ytimg.com/vi/EzNA5JAoOdX/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'EzNA5JAoOdX',
    durationSeconds: 355,
    isPublished: true,
  },
  {
    title: 'Dil Hai Ki Manta Nahin',
    artist: 'Kumar Sanu & Anuradha Paudwal',
    album: 'Dil Hai Ki Manta Nahin',
    thumbnailUrl: 'https://i.ytimg.com/vi/Zl038lvkkk0/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'Zl038lvkkk0',
    durationSeconds: 340,
    isPublished: true,
  },
  {
    title: 'Chura Ke Dil Mera',
    artist: 'Kumar Sanu & Alka Yagnik',
    album: 'Main Khiladi Tu Anari',
    thumbnailUrl: 'https://i.ytimg.com/vi/kDqK8xnfMwY/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'kDqK8xnfMwY',
    durationSeconds: 325,
    isPublished: true,
  },
  {
    title: 'Tu Meri Zindagi Hai',
    artist: 'Kumar Sanu & Anuradha Paudwal',
    album: 'Aashiqui',
    thumbnailUrl: 'https://i.ytimg.com/vi/C3d51OtZAMM/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'C3d51OtZAMM',
    durationSeconds: 310,
    isPublished: true,
  },
  {
    title: 'Nazar Ke Samne Jigar Ke Paas',
    artist: 'Kumar Sanu & Anuradha Paudwal',
    album: 'Aashiqui',
    thumbnailUrl: 'https://i.ytimg.com/vi/9RxRCx6rEJk/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: '9RxRCx6rEJk',
    durationSeconds: 295,
    isPublished: true,
  },
  {
    title: 'Baazigar O Baazigar',
    artist: 'Kumar Sanu & Alka Yagnik',
    album: 'Baazigar',
    thumbnailUrl: 'https://i.ytimg.com/vi/PUO7_Gi6ipg/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'PUO7_Gi6ipg',
    durationSeconds: 315,
    isPublished: true,
  },
  {
    title: 'Kitna Haseen Chehra',
    artist: 'Kumar Sanu & Alka Yagnik',
    album: 'Dilwale',
    thumbnailUrl: 'https://i.ytimg.com/vi/gf7yFyDdSX4/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'gf7yFyDdSX4',
    durationSeconds: 330,
    isPublished: true,
  },
  {
    title: 'Pehla Pehla Pyar Hai',
    artist: 'Kumar Sanu & Kavita Krishnamurthy',
    album: 'Hum Aapke Hain Koun',
    thumbnailUrl: 'https://i.ytimg.com/vi/h1hKK8nk2eU/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'h1hKK8nk2eU',
    durationSeconds: 305,
    isPublished: true,
  },
  // ── Udit Narayan / Alka Yagnik / Sonu Nigam ─────────────────────────
  {
    title: 'Jeeye To Jeeye Kaise',
    artist: 'Kumar Sanu & Anuradha Paudwal',
    album: 'Saajan',
    thumbnailUrl: 'https://i.ytimg.com/vi/XOxz0Hr3Hzo/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'XOxz0Hr3Hzo',
    durationSeconds: 345,
    isPublished: true,
  },
  {
    title: 'Ek Ladki Ko Dekha Toh Aisa Laga',
    artist: 'Kumar Sanu',
    album: '1942: A Love Story',
    thumbnailUrl: 'https://i.ytimg.com/vi/R9KFZ0ObMzE/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'R9KFZ0ObMzE',
    durationSeconds: 290,
    isPublished: true,
  },
  {
    title: 'Tujhko Dekha To Yeh Jana Sanam',
    artist: 'Lata Mangeshkar & Kumar Sanu',
    album: 'Dilwale Dulhania Le Jayenge',
    thumbnailUrl: 'https://i.ytimg.com/vi/fM0zCyBGdmU/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'fM0zCyBGdmU',
    durationSeconds: 310,
    isPublished: true,
  },
  {
    title: 'Kuch Kuch Hota Hai',
    artist: 'Udit Narayan & Kavita Krishnamurthy',
    album: 'Kuch Kuch Hota Hai',
    thumbnailUrl: 'https://i.ytimg.com/vi/GWPLAb90iOI/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'GWPLAb90iOI',
    durationSeconds: 360,
    isPublished: true,
  },
  {
    title: 'Aaye Ho Meri Zindagi Mein',
    artist: 'Udit Narayan & Kavita Krishnamurthy',
    album: 'Raja Hindustani',
    thumbnailUrl: 'https://i.ytimg.com/vi/JwDMc-GSMAA/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'JwDMc-GSMAA',
    durationSeconds: 320,
    isPublished: true,
  },
  {
    title: 'Yeh Kaali Kaali Aankhein',
    artist: 'Kumar Sanu & Sadhna Sargam',
    album: 'Baazigar',
    thumbnailUrl: 'https://i.ytimg.com/vi/yzYnEuq9J34/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'yzYnEuq9J34',
    durationSeconds: 300,
    isPublished: true,
  },
  {
    title: 'Hum Tere Bin Kahin Reh Nahin Sakte',
    artist: 'Kumar Sanu & Alka Yagnik',
    album: 'Baazigar',
    thumbnailUrl: 'https://i.ytimg.com/vi/sHE8TIciqtM/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'sHE8TIciqtM',
    durationSeconds: 335,
    isPublished: true,
  },
  {
    title: 'Tera Mera Pyar Amar',
    artist: 'Kumar Sanu & Alka Yagnik',
    album: 'Assi Nabbe Poore Sau',
    thumbnailUrl: 'https://i.ytimg.com/vi/kBmqGa3pxMQ/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'kBmqGa3pxMQ',
    durationSeconds: 315,
    isPublished: true,
  },
  {
    title: 'Tumse Milna Batein Karna',
    artist: 'Kumar Sanu & Alka Yagnik',
    album: 'Prem Qaidi',
    thumbnailUrl: 'https://i.ytimg.com/vi/y0PtZRcPpik/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'y0PtZRcPpik',
    durationSeconds: 285,
    isPublished: true,
  },
  {
    title: 'Pyar Itna Mat Karo',
    artist: 'Kumar Sanu & Anuradha Paudwal',
    album: 'Sangram',
    thumbnailUrl: 'https://i.ytimg.com/vi/ZiO3fZwxsKA/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'ZiO3fZwxsKA',
    durationSeconds: 340,
    isPublished: true,
  },
  {
    title: 'Main Koi Aisa Geet Gaoon',
    artist: 'Kumar Sanu',
    album: 'Yes Boss',
    thumbnailUrl: 'https://i.ytimg.com/vi/g6t-YKxMiEY/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'g6t-YKxMiEY',
    durationSeconds: 295,
    isPublished: true,
  },
  {
    title: 'O Sanam',
    artist: 'Lucky Ali',
    album: 'Sunoh',
    thumbnailUrl: 'https://i.ytimg.com/vi/vvhpJJBpFUk/hqdefault.jpg',
    provider: 'youtube',
    providerVideoId: 'vvhpJJBpFUk',
    durationSeconds: 280,
    isPublished: true,
  },
];

async function seedOldSongsExtra() {
  console.log('--- Seeding extra Old Song tracks into MongoDB ---');
  await connectDB();

  const playlist = await Playlist.findOne({ name: 'Old Song' });
  if (!playlist) {
    console.error('❌  "Old Song" playlist not found! Run the main seed first.');
    process.exit(1);
  }

  let addedCount = 0;

  for (const songData of newOldSongs) {
    // Upsert track
    let track = await Track.findOne({ provider: 'youtube', providerVideoId: songData.providerVideoId });
    if (!track) {
      track = await Track.create(songData);
      console.log(`  ✅ Created track: ${songData.title}`);
    } else {
      console.log(`  ⏭  Track already exists: ${track.title}`);
    }

    // Add to playlist only if not already there
    const alreadyInPlaylist = playlist.tracks.some(
      (t) => t.track && t.track.toString() === track.id.toString()
    );

    if (!alreadyInPlaylist) {
      playlist.tracks.push({
        track: track.id,
        position: playlist.tracks.length,
        addedAt: new Date(),
      });
      addedCount++;
    } else {
      console.log(`  ⏭  Already in playlist: ${track.title}`);
    }
  }

  await playlist.save();
  console.log(`\n✅  Added ${addedCount} new tracks to "Old Song" playlist.`);
  console.log(`📀  "Old Song" now has ${playlist.tracks.length} tracks total.`);
  console.log('--- Done! ---');
}

seedOldSongsExtra()
  .then(async () => {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
