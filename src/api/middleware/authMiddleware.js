const admin = require('firebase-admin');
const db = admin.firestore(); // Utiliser Firestore pour accéder à la base de données

const getUserDataAndVerifyToken = async (req, res, next) => {
  // Extraire le token de l'en-tête Authorization
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Aucun token fourni.' });
  }

  try {
    // Vérifier le token Firebase et décoder les informations utilisateur
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Données utilisateur introuvables.' });
    }

    // Attacher les informations utilisateur à la requête
    req.user = { userId, ...userDoc.data() };

    // Passer au gestionnaire suivant
    next();
  } catch (error) {
    console.error('Erreur lors de la vérification du token Firebase:', error);
    return res.status(401).json({ error: 'Échec de l’authentification.' });
  }
};

module.exports = getUserDataAndVerifyToken;
