const db = require('../db');

const getNews = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "News"');
    res.json(result.rows);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error fetching news' });
  }
};

const getNewsById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM "News" WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching news by id' });
  }
};

module.exports = { getNews, getNewsById }; 