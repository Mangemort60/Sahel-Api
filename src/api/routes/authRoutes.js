const express = require('express');
const router = express.Router();
const { registerUser, getUserDataAndVerifyToken } = require('../controllers/authController');

// Route pour l'inscription
router.post('/register', registerUser);
router.get('/login', getUserDataAndVerifyToken, (req, res) => {
    // Ici, getUserDataAndVerifyToken est utilisé comme middleware pour vérifier le token
    // et attacher les données utilisateur à req.user.
    // Vous pouvez ensuite envoyer ces données comme réponse.
    if (req.user) {
      res.json(req.user);
    } else {
      // Dans le cas où getUserDataAndVerifyToken ne trouve pas l'utilisateur ou le token est invalide,
      // il aura déjà envoyé une réponse, donc ce bloc peut ne pas être nécessaire,
      // mais il est utile pour comprendre le flux.
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
  });


module.exports = router;
