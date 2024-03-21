const express = require('express');
const router = express.Router();
const { registerUser, getUserDataAndVerifyToken } = require('../controllers/authController');

// Route pour l'inscription
router.post('/register', registerUser);
router.get('/login', getUserDataAndVerifyToken)


module.exports = router;
