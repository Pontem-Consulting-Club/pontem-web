const express = require('express');
const { getNews, getNewsById } = require('../controllers/newsController');
const router = express.Router();

router.get('/news', getNews);
router.get('/news/:id', getNewsById);

module.exports = router; 