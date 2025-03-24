const express = require('express');
const { getProjects } = require('../controllers/projectsController');
const router = express.Router();

router.get('/social-consulting', getProjects);

module.exports = router;
