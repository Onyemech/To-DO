const express = require('express');
const router = express.Router();
const AuthController = require('../Controllers/authController');
const authMiddleware = require('../middleware/authJwt');

router.post('/register',AuthController.registerUser)
router.post('/login',AuthController.loginUser)
router.post('/update-player-id', authMiddleware, AuthController.updatePlayerId)

module.exports = router;