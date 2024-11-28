const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// guest routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/token', authController.token);
router.delete('/logout', authController.logout);

// authenticated-required routes
router.use(authenticateToken);
router.get('/posts', authController.posts);

module.exports = router;