const admin = require('firebase-admin');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }

  try {
    admin.auth().verifyIdToken(token)
      .then(decodedToken => {
        req.user = decodedToken;
        next();
      }).catch(error => {
        console.error(error);
        res.status(401).send('Invalid Token');
      });
  } catch (error) {
    console.error(error);
    return res.status(401).send('Invalid Token');
  }
};

module.exports = verifyToken;
