const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');

// Route pour l'inscription
router.post('/register', registerUser);


module.exports = router;
