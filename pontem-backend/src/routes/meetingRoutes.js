const express = require('express');
const router = express.Router();
const { getAllMeetings, createMeeting } = require('../controllers/meetingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAllMeetings);
router.post('/', authMiddleware, createMeeting);

module.exports = router;