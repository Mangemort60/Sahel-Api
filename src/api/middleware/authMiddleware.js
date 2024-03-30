const admin = require('firebase-admin');

const getUserDataAndVerifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
      return res.status(401).json({ error: 'Aucun token fourni.' });
  }
  try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
          return res.status(404).json({ error: 'Données utilisateur introuvables.' });
      }
      req.user = { userId, ...userDoc.data() }; // Attache les données utilisateur à req
      next(); // Passe au gestionnaire suivant
  } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Échec de l’authentification.' });
  }
};


module.exports = getUserDataAndVerifyToken;
