// controllers/cleanupController.js

const { db } = require('../../config/firebaseConfig');

const cleanupReservations = async (req, res) => {
  const now = new Date();
  const reservationsRef = db.collection('reservations');
  const snapshot = await reservationsRef.where('expirationDate', '<=', now).get();

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  res.send('Expired reservations cleaned up successfully.');
};

module.exports = { cleanupReservations };
