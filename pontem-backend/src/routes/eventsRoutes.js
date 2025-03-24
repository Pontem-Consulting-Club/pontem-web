const express = require('express');
const { getEvents } = require('../controllers/eventsController');
const router = express.Router();

router.get('/scheduled', getEvents);

module.exports = router;