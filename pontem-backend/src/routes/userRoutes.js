const express = require('express');
const { getAllUsers, createUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.get('/', authMiddleware, getAllUsers);
router.post('/', upload.single('profilePicture'), createUser);

module.exports = router;