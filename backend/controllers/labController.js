const db = require('../config/database');

exports.getAllLabs = async (req, res) => {
  try {
    const [labs] = await db.query('SELECT id, name FROM labs ORDER BY name ASC');
    res.json(labs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
