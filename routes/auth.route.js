const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/token', authController.token);
router.delete('/logout', authController.logout);

router.use(authenticateToken);

// Protected route example
router.get('/posts', authController.posts);

module.exports = router;