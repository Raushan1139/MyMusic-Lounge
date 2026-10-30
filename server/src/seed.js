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
      thumbnailUrl: 'https://i.ytimg.com/vi/8G4wERmdYIQ/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: '8G4wERmdYIQ',
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
      thumbnailUrl: 'https://i.ytimg.com/vi/akJIT9uQDus/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'akJIT9uQDus',
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

    // Old Song Playlist Tracks (RDjD3SGW0NHY0)
    {
      title: 'Chand Se Parda Kijiye',
      artist: 'Kumar Sanu',
      album: 'Aao Pyar Karen',
      thumbnailUrl: 'https://i.ytimg.com/vi/jD3SGW0NHY0/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'jD3SGW0NHY0',
      durationSeconds: 345,
      isPublished: true,
    },
    {
      title: 'Chori Chori Dil Tera Churayenge',
      artist: 'Kumar Sanu',
      album: 'Phool Aur Angaar',
      thumbnailUrl: 'https://i.ytimg.com/vi/QjqKXFGM3eI/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'QjqKXFGM3eI',
      durationSeconds: 320,
      isPublished: true,
    },
    {
      title: 'Koi To Saathi Chahiye',
      artist: 'Kumar Sanu',
      album: 'Kasoor',
      thumbnailUrl: 'https://i.ytimg.com/vi/CPjVZpq3ZDA/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'CPjVZpq3ZDA',
      durationSeconds: 335,
      isPublished: true,
    },
    {
      title: 'Is Tarah Aashiqui Ka Asar Chhod Jaaonga',
      artist: 'Kumar Sanu',
      album: 'Imtihaan',
      thumbnailUrl: 'https://i.ytimg.com/vi/x8AIGcNTjvs/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'x8AIGcNTjvs',
      durationSeconds: 310,
      isPublished: true,
    },
    {
      title: 'O Mere Dil Ke Chain',
      artist: 'Kishore Kumar',
      album: 'Mere Jeevan Saathi',
      thumbnailUrl: 'https://i.ytimg.com/vi/BDOufDEYYDo/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'BDOufDEYYDo',
      durationSeconds: 280,
      isPublished: true,
    },
    {
      title: 'Jab Tum Aa Jaate Ho',
      artist: 'Sonu Nigam & Kavita Krishnamurthy',
      album: 'Maharaja',
      thumbnailUrl: 'https://i.ytimg.com/vi/X8TdLtS_8jE/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'X8TdLtS_8jE',
      durationSeconds: 325,
      isPublished: true,
    },
    {
      title: 'Sochenge Tumhe Pyar',
      artist: 'Kumar Sanu',
      album: 'Deewana',
      thumbnailUrl: 'https://i.ytimg.com/vi/lFdSi01tpYM/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'lFdSi01tpYM',
      durationSeconds: 360,
      isPublished: true,
    },
    {
      title: 'Kabhi Shaam Dhale To Mere Dil Mein Aa Jaana',
      artist: 'Mahalakshmi Iyer',
      album: 'Sur - The Melody of Life',
      thumbnailUrl: 'https://i.ytimg.com/vi/3g0MQ32Lyck/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: '3g0MQ32Lyck',
      durationSeconds: 310,
      isPublished: true,
    },
    {
      title: 'Dil Ka Aalam Main Kya Bataun Tujhe',
      artist: 'Kumar Sanu',
      album: 'Aashiqui',
      thumbnailUrl: 'https://i.ytimg.com/vi/OdvVemsA17c/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'OdvVemsA17c',
      durationSeconds: 300,
      isPublished: true,
    },
    {
      title: 'Jhuki Jhuki Nazar Teri Kamaal Kar Gayi',
      artist: 'Alka Yagnik & Udit Narayan',
      album: 'Raja',
      thumbnailUrl: 'https://i.ytimg.com/vi/vf0au_2CYYE/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'vf0au_2CYYE',
      durationSeconds: 325,
      isPublished: true,
    },
    // Old Song Extra tracks (30 total after expansion)
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

    // New Love Song Playlist Tracks (RDN_9RNX12X8g)
    {
      title: 'Top 20 Romantic Songs (Gehra Hua & Hits)',
      artist: 'Arijit Singh & Various Artists',
      album: 'Romantic Essentials',
      thumbnailUrl: 'https://i.ytimg.com/vi/N_9RNX12X8g/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'N_9RNX12X8g',
      durationSeconds: 380,
      isPublished: true,
    },
    {
      title: 'Khairiyat',
      artist: 'Arijit Singh',
      album: 'Chhichhore',
      thumbnailUrl: 'https://i.ytimg.com/vi/9pIXNy-pS10/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: '9pIXNy-pS10',
      durationSeconds: 280,
      isPublished: true,
    },
    {
      title: 'Gehra Hua',
      artist: 'Arijit Singh & Shashwat Sachdev',
      album: 'Dhurandhar',
      thumbnailUrl: 'https://i.ytimg.com/vi/GX9x62kFsVU/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'GX9x62kFsVU',
      durationSeconds: 290,
      isPublished: true,
    },
    {
      title: 'Raataan Lambiyan',
      artist: 'Jubin Nautiyal & Asees Kaur',
      album: 'Shershaah',
      thumbnailUrl: 'https://i.ytimg.com/vi/3EJGAKPifNs/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: '3EJGAKPifNs',
      durationSeconds: 230,
      isPublished: true,
    },
    {
      title: 'Kaun Tujhe',
      artist: 'Palak Muchhal & Amaal Mallik',
      album: 'M.S. Dhoni - The Untold Story',
      thumbnailUrl: 'https://i.ytimg.com/vi/Ov0YGGSY6gY/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'Ov0YGGSY6gY',
      durationSeconds: 240,
      isPublished: true,
    },
    {
      title: 'Pehle Bhi Main',
      artist: 'Vishal Mishra & Raj Shekhar',
      album: 'Animal',
      thumbnailUrl: 'https://i.ytimg.com/vi/iAIBF2ngbWY/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'iAIBF2ngbWY',
      durationSeconds: 250,
      isPublished: true,
    },
    {
      title: 'Apna Bana Le',
      artist: 'Arijit Singh & Sachin-Jigar',
      album: 'Bhediya',
      thumbnailUrl: 'https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'ElZfdU54Cp8',
      durationSeconds: 260,
      isPublished: true,
    },
    {
      title: 'Tum Ho Toh',
      artist: 'Vishal Mishra & Hansika Pareek',
      album: 'Saiyaara',
      thumbnailUrl: 'https://i.ytimg.com/vi/8SYPKQMW_2Q/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: '8SYPKQMW_2Q',
      durationSeconds: 245,
      isPublished: true,
    },
    {
      title: 'Saiyaara',
      artist: 'Mohit Chauhan & Tarannum Mallik',
      album: 'Ek Tha Tiger',
      thumbnailUrl: 'https://i.ytimg.com/vi/A5pSnIwbpaM/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'A5pSnIwbpaM',
      durationSeconds: 255,
      isPublished: true,
    },
    {
      title: 'Jogi',
      artist: 'Yasser Desai & Aakanksha Sharma',
      album: 'Shaadi Mein Zaroor Aana',
      thumbnailUrl: 'https://i.ytimg.com/vi/HexFqifusOk/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'HexFqifusOk',
      durationSeconds: 275,
      isPublished: true,
    },
    {
      title: 'Khuda Jaane',
      artist: 'KK & Shilpa Rao',
      album: 'Bachna Ae Haseeno',
      thumbnailUrl: 'https://i.ytimg.com/vi/cmMiyZaSELo/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'cmMiyZaSELo',
      durationSeconds: 330,
      isPublished: true,
    },
    {
      title: 'Galliyan',
      artist: 'Ankit Tiwari',
      album: 'Ek Villain',
      thumbnailUrl: 'https://i.ytimg.com/vi/FxAG_11PzCk/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'FxAG_11PzCk',
      durationSeconds: 340,
      isPublished: true,
    },
    {
      title: 'Tera Hone Laga Hoon',
      artist: 'Atif Aslam & Alisha Chinai',
      album: 'Ajab Prem Ki Ghazab Kahani',
      thumbnailUrl: 'https://i.ytimg.com/vi/rTuxUAuJRyY/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'rTuxUAuJRyY',
      durationSeconds: 300,
      isPublished: true,
    },
    {
      title: 'Tum Se Hi',
      artist: 'Mohit Chauhan & Pritam',
      album: 'Jab We Met',
      thumbnailUrl: 'https://i.ytimg.com/vi/Cb6wuzOurPc/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'Cb6wuzOurPc',
      durationSeconds: 320,
      isPublished: true,
    },
    {
      title: 'Pee Loon',
      artist: 'Mohit Chauhan',
      album: 'Once Upon A Time in Mumbaai',
      thumbnailUrl: 'https://i.ytimg.com/vi/WCTro3qabjE/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'WCTro3qabjE',
      durationSeconds: 290,
      isPublished: true,
    },
    {
      title: 'Aankhon Mein Teri Ajab Si',
      artist: 'KK',
      album: 'Om Shanti Om',
      thumbnailUrl: 'https://i.ytimg.com/vi/7KKVb0_IdD4/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: '7KKVb0_IdD4',
      durationSeconds: 245,
      isPublished: true,
    },
    {
      title: 'Main Agar Kahoon',
      artist: 'Sonu Nigam & Shreya Ghoshal',
      album: 'Om Shanti Om',
      thumbnailUrl: 'https://i.ytimg.com/vi/DAYszemgPxc/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'DAYszemgPxc',
      durationSeconds: 310,
      isPublished: true,
    },
    {
      title: 'Thoda Thoda Pyaar',
      artist: 'Stebin Ben & Nilesh Ahuja',
      album: 'Thoda Thoda Pyaar Single',
      thumbnailUrl: 'https://i.ytimg.com/vi/BHlCNUyu5EU/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'BHlCNUyu5EU',
      durationSeconds: 245,
      isPublished: true,
    },
    {
      title: 'Dil Ibaadat',
      artist: 'KK & Pritam',
      album: 'Tum Mile',
      thumbnailUrl: 'https://i.ytimg.com/vi/U2QNhsAgIIE/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'U2QNhsAgIIE',
      durationSeconds: 330,
      isPublished: true,
    },
    {
      title: 'Zara Sa',
      artist: 'KK & Pritam',
      album: 'Jannat',
      thumbnailUrl: 'https://i.ytimg.com/vi/-8C_2BBVWk8/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: '-8C_2BBVWk8',
      durationSeconds: 305,
      isPublished: true,
    },
    {
      title: 'Jeene Laga Hoon',
      artist: 'Atif Aslam & Shreya Ghoshal',
      album: 'Ramaiya Vastavaiya',
      thumbnailUrl: 'https://i.ytimg.com/vi/qpIdoaaPa6U/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'qpIdoaaPa6U',
      durationSeconds: 235,
      isPublished: true,
    },
    {
      title: 'Sanam Re',
      artist: 'Arijit Singh & Mithoon',
      album: 'Sanam Re',
      thumbnailUrl: 'https://i.ytimg.com/vi/DS-raAyMxl4/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'DS-raAyMxl4',
      durationSeconds: 308,
      isPublished: true,
    },
    {
      title: 'Hale Dil',
      artist: 'Harshit Saxena',
      album: 'Murder 2',
      thumbnailUrl: 'https://i.ytimg.com/vi/acdKE2hja7w/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'acdKE2hja7w',
      durationSeconds: 345,
      isPublished: true,
    },
    {
      title: 'Ek Din Teri Raahon Mein',
      artist: 'Javed Ali & Pritam',
      album: 'Naqaab',
      thumbnailUrl: 'https://i.ytimg.com/vi/vQchZx9MvJ8/hqdefault.jpg',
      provider: 'youtube',
      providerVideoId: 'vQchZx9MvJ8',
      durationSeconds: 290,
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
    {
      name: 'Old Song',
      description: 'Evergreen Bollywood 90s Hits & Golden Melodies inspired by YouTube mix RDjD3SGW0NHY0 (Kumar Sanu, Kishore Kumar, Alka Yagnik, Sonu Nigam).',
      coverUrl: 'https://i.ytimg.com/vi/jD3SGW0NHY0/hqdefault.jpg',
      trackIndices: [
        18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
        28, 29, 30, 31, 32, 33, 34, 35, 36, 37,
        38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
      ],
    },
    {
      name: 'New Love Song',
      description: 'The ultimate modern romantic collection featuring Arijit Singh, KK, Atif Aslam, Mohit Chauhan, Vishal Mishra & Jubin Nautiyal (from YouTube mix RDN_9RNX12X8g).',
      coverUrl: 'https://i.ytimg.com/vi/N_9RNX12X8g/hqdefault.jpg',
      trackIndices: [
        48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
        60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71
      ],
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
