const db = require('../db');

const getProjects = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Projects"');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
};

module.exports = { getProjects };