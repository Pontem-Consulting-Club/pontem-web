const express = require('express');
const { login, getUserInfo } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.get('/me', getUserInfo);

module.exports = router;