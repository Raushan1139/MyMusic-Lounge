/**
 * Direct MongoDB seeder for extra Old Song tracks
 * Connects using server's config, bypasses HTTP API
 * Run: node server/seed-old-songs-direct.js
 */
process.chdir(__dirname);
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || '';

const TrackSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  thumbnailUrl: String,
  provider: String,
  providerVideoId: String,
  durationSeconds: Number,
  isPublished: Boolean,
}, { timestamps: true });

const PlaylistTrackSchema = new mongoose.Schema({
  track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
  position: Number,
  addedAt: Date,
});

const PlaylistSchema = new mongoose.Schema({
  name: String,
  description: String,
  coverUrl: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: Boolean,
  isPublished: Boolean,
  tracks: [PlaylistTrackSchema],
}, { timestamps: true });

const Track = mongoose.model('Track', TrackSchema);
const Playlist = mongoose.model('Playlist', PlaylistSchema);

const newOldSongs = [
  { title: 'Mera Dil Bhi Kitna Pagal Hai', artist: 'Kumar Sanu & Alka Yagnik', album: 'Saajan', providerVideoId: 'EzNA5JAoOdX', durationSeconds: 355 },
  { title: 'Dil Hai Ki Manta Nahin', artist: 'Kumar Sanu & Anuradha Paudwal', album: 'Dil Hai Ki Manta Nahin', providerVideoId: 'Zl038lvkkk0', durationSeconds: 340 },
  { title: 'Chura Ke Dil Mera', artist: 'Kumar Sanu & Alka Yagnik', album: 'Main Khiladi Tu Anari', providerVideoId: 'kDqK8xnfMwY', durationSeconds: 325 },
  { title: 'Tu Meri Zindagi Hai', artist: 'Kumar Sanu & Anuradha Paudwal', album: 'Aashiqui', providerVideoId: 'C3d51OtZAMM', durationSeconds: 310 },
  { title: 'Nazar Ke Samne Jigar Ke Paas', artist: 'Kumar Sanu & Anuradha Paudwal', album: 'Aashiqui', providerVideoId: '9RxRCx6rEJk', durationSeconds: 295 },
  { title: 'Baazigar O Baazigar', artist: 'Kumar Sanu & Alka Yagnik', album: 'Baazigar', providerVideoId: 'PUO7_Gi6ipg', durationSeconds: 315 },
  { title: 'Kitna Haseen Chehra', artist: 'Kumar Sanu & Alka Yagnik', album: 'Dilwale', providerVideoId: 'gf7yFyDdSX4', durationSeconds: 330 },
  { title: 'Pehla Pehla Pyar Hai', artist: 'Kumar Sanu & Kavita Krishnamurthy', album: 'Hum Aapke Hain Koun', providerVideoId: 'h1hKK8nk2eU', durationSeconds: 305 },
  { title: 'Jeeye To Jeeye Kaise', artist: 'Kumar Sanu & Anuradha Paudwal', album: 'Saajan', providerVideoId: 'XOxz0Hr3Hzo', durationSeconds: 345 },
  { title: 'Ek Ladki Ko Dekha Toh Aisa Laga', artist: 'Kumar Sanu', album: '1942: A Love Story', providerVideoId: 'R9KFZ0ObMzE', durationSeconds: 290 },
  { title: 'Tujhko Dekha To Yeh Jana Sanam', artist: 'Lata Mangeshkar & Kumar Sanu', album: 'Dilwale Dulhania Le Jayenge', providerVideoId: 'fM0zCyBGdmU', durationSeconds: 310 },
  { title: 'Kuch Kuch Hota Hai', artist: 'Udit Narayan & Kavita Krishnamurthy', album: 'Kuch Kuch Hota Hai', providerVideoId: 'GWPLAb90iOI', durationSeconds: 360 },
  { title: 'Aaye Ho Meri Zindagi Mein', artist: 'Udit Narayan & Kavita Krishnamurthy', album: 'Raja Hindustani', providerVideoId: 'JwDMc-GSMAA', durationSeconds: 320 },
  { title: 'Yeh Kaali Kaali Aankhein', artist: 'Kumar Sanu & Sadhna Sargam', album: 'Baazigar', providerVideoId: 'yzYnEuq9J34', durationSeconds: 300 },
  { title: 'Hum Tere Bin Kahin Reh Nahin Sakte', artist: 'Kumar Sanu & Alka Yagnik', album: 'Baazigar', providerVideoId: 'sHE8TIciqtM', durationSeconds: 335 },
  { title: 'Tera Mera Pyar Amar', artist: 'Kumar Sanu & Alka Yagnik', album: 'Assi Nabbe Poore Sau', providerVideoId: 'kBmqGa3pxMQ', durationSeconds: 315 },
  { title: 'Tumse Milna Batein Karna', artist: 'Kumar Sanu & Alka Yagnik', album: 'Prem Qaidi', providerVideoId: 'y0PtZRcPpik', durationSeconds: 285 },
  { title: 'Pyar Itna Mat Karo', artist: 'Kumar Sanu & Anuradha Paudwal', album: 'Sangram', providerVideoId: 'ZiO3fZwxsKA', durationSeconds: 340 },
  { title: 'Main Koi Aisa Geet Gaoon', artist: 'Kumar Sanu', album: 'Yes Boss', providerVideoId: 'g6t-YKxMiEY', durationSeconds: 295 },
  { title: 'O Sanam', artist: 'Lucky Ali', album: 'Sunoh', providerVideoId: 'vvhpJJBpFUk', durationSeconds: 280 },
];

async function run() {
  if (!MONGODB_URI) {
    console.error('No MONGODB_URI in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });
  console.log('Connected!');

  const playlist = await Playlist.findOne({ name: 'Old Song' });
  if (!playlist) {
    console.error('"Old Song" playlist not found in DB');
    process.exit(1);
  }
  console.log(`Found "Old Song" playlist with ${playlist.tracks.length} existing tracks`);

  let added = 0;
  let skipped = 0;

  for (const songData of newOldSongs) {
    let track = await Track.findOne({ provider: 'youtube', providerVideoId: songData.providerVideoId });
    if (!track) {
      track = await Track.create({
        ...songData,
        provider: 'youtube',
        thumbnailUrl: `https://i.ytimg.com/vi/${songData.providerVideoId}/hqdefault.jpg`,
        isPublished: true,
      });
      console.log(`  ✅ Created: ${songData.title}`);
    } else {
      console.log(`  ⏭  Exists: ${track.title}`);
    }

    const alreadyIn = playlist.tracks.some(
      (t) => t.track && t.track.toString() === track._id.toString()
    );
    if (!alreadyIn) {
      playlist.tracks.push({ track: track._id, position: playlist.tracks.length, addedAt: new Date() });
      added++;
    } else {
      skipped++;
      console.log(`     (already in playlist)`);
    }
  }

  await playlist.save();
  console.log(`\n✅ Added ${added} new tracks to "Old Song" (${skipped} already present)`);
  console.log(`📀 "Old Song" now has ${playlist.tracks.length} tracks total`);
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
