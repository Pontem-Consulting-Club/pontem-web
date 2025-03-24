const db = require('../db');

const getEvents = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Events"');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
};

const getProjects = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Projects"');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
};

const getNews = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "News"');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching news' });
  }
};

const createEvent = async (req, res) => {
  const { title, subtitle, description, date, image_url, location, link } = req.body;
  await db.query('INSERT INTO "Events" (title, subtitle, description, date, image_url, location, link) VALUES ($1, $2, $3, $4, $5, $6, $7)', [title, subtitle, description, date, image_url, location, link]);
  res.status(201).json({ message: 'Event created successfully' });
};

const createProject = async (req, res) => {
  const { title, subtitle, description, image_url, link, link_text } = req.body;
  await db.query('INSERT INTO "Projects" (title, subtitle, description, image_url, link, link_text) VALUES ($1, $2, $3, $4, $5, $6)', [title, subtitle, description, image_url, link, link_text]);
  res.status(201).json({ message: 'Project created successfully' });
};

const createNews = async (req, res) => {
  const { title, subtitle, type, image_url, author, published_date, content, link } = req.body;
  await db.query('INSERT INTO "News" (title, subtitle, type, image_url, author, published_date, content, link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [title, subtitle, type, image_url, author, published_date, content, link]);
  res.status(201).json({ message: 'News created successfully' });
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM "Events" WHERE id = $1', [id]);
  res.status(200).json({ message: 'Event deleted successfully' });
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM "Projects" WHERE id = $1', [id]);
  res.status(200).json({ message: 'Project deleted successfully' });
};

const deleteNews = async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM "News" WHERE id = $1', [id]);
  res.status(200).json({ message: 'News deleted successfully' });
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, description, date, image_url, location, link } = req.body;
  await db.query('UPDATE "Events" SET title = $1, subtitle = $2, description = $3, date = $4, image_url = $5, location = $6, link = $7 WHERE id = $8', [title, subtitle, description, date, image_url, location, link, id]);
  res.status(200).json({ message: 'Event updated successfully' });
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, description, image_url, link, link_text } = req.body;
  await db.query('UPDATE "Projects" SET title = $1, subtitle = $2, description = $3, image_url = $4, link = $5, link_text = $6 WHERE id = $7', [title, subtitle, description, image_url, link, link_text, id]);
  res.status(200).json({ message: 'Project updated successfully' });
};

const updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, description, date, image_url, link } = req.body;
  await db.query('UPDATE "News" SET title = $1, subtitle = $2, description = $3, date = $4, image_url = $5, link = $6 WHERE id = $7', [title, subtitle, description, date, image_url, link, id]);
  res.status(200).json({ message: 'News updated successfully' });
};

module.exports = { getEvents, getProjects, getNews, createEvent, createProject, createNews, deleteEvent, deleteProject, deleteNews, updateEvent, updateProject, updateNews }; 