const prisma = require('../config/db');

/**
 * Public: Get site settings
 */
exports.getPublicSettings = async (req, res, next) => {
  try {
    const settings = await prisma.appSetting.findMany();
    const settingsMap = {};

    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    // Sensible defaults
    const publicSettings = {
      site_name: settingsMap.site_name || 'MyMusic Lounge',
      site_tagline: settingsMap.site_tagline || 'Your Music. Your Mood. Your Space.',
      hero_title: settingsMap.hero_title || 'Welcome to MyMusic Lounge',
      hero_subtitle: settingsMap.hero_subtitle || 'An immersive digital music lounge. Listen to our live owner-curated radio station or take the decks with your personal playlist.',
      chat_enabled: settingsMap.chat_enabled !== 'false',
      guest_access: settingsMap.guest_access !== 'false',
      theme_accent: settingsMap.theme_accent || '#8B5CF6',
    };

    return res.json({ success: true, settings: publicSettings });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update site settings
 */
exports.updateAdminSettings = async (req, res, next) => {
  try {
    const settingsObj = req.body; // e.g. { site_name: "...", hero_title: "..." }

    const updates = Object.entries(settingsObj).map(([key, value]) =>
      prisma.appSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await Promise.all(updates);

    return res.json({
      success: true,
      message: 'Lounge settings updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
