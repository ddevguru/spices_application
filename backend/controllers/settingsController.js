const db = require('../config/db');

exports.getSettings = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const result = await db.query('SELECT value FROM store_settings WHERE key = $1', ['general_settings']);
      if (result.rows.length > 0) {
        return res.json(result.rows[0].value);
      }
    }
    const fb = db.getFallbackDb();
    return res.json(fb.settings || {});
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const newSettings = req.body;
    if (db.isPostgresConnected()) {
      await db.query(`
        INSERT INTO store_settings (key, value)
        VALUES ('general_settings', $1)
        ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP
      `, [JSON.stringify(newSettings)]);
    }
    const fb = db.getFallbackDb();
    fb.settings = { ...fb.settings, ...newSettings };
    db.saveFallbackDb(fb);
    return res.json(fb.settings);
  } catch (err) {
    next(err);
  }
};

