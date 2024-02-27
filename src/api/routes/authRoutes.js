const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');

// Route pour l'inscription
router.post('/register', registerUser);

// Route pour la connexion d'un utilisateur
router.post('/login', loginUser);

// Route pour la déconnexion d'un utilisateur
// Notez que la déconnexion est souvent gérée côté client, mais vous pourriez
// proposer une route si vous avez besoin d'effectuer des actions spécifiques côté serveur lors de la déconnexion.
router.post('/logout', logoutUser);

module.exports = router;
