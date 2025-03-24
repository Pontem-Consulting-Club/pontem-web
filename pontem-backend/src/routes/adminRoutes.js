const express = require('express');
const { getEvents, getProjects, getNews, 
  createEvent, createProject, createNews,
  deleteEvent, deleteProject, deleteNews, 
  updateEvent, updateProject, updateNews } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/events', authMiddleware, getEvents);
router.get('/projects', authMiddleware, getProjects);
router.get('/news', authMiddleware, getNews);

router.post('/events', authMiddleware, createEvent);
router.post('/projects', authMiddleware, createProject);
router.post('/news', authMiddleware, createNews);

router.delete('/events/:id', authMiddleware, deleteEvent);
router.delete('/projects/:id', authMiddleware, deleteProject);
router.delete('/news/:id', authMiddleware, deleteNews);

router.put('/events/:id', authMiddleware, updateEvent);
router.put('/projects/:id', authMiddleware, updateProject);
router.put('/news/:id', authMiddleware, updateNews);

module.exports = router; 