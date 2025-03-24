const db = require('../db');

const getEvents = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Events"');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
};

module.exports = { getEvents };