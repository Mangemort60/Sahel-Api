const { db } = require('../../config/firebaseConfig'); // Assurez-vous que ce chemin correspond à votre configuration Firebase

// Fonction pour créer une nouvelle réservation
const createReservation = async (req, res) => {
    const { areaSize, fruitsBasketSelected, nbrOfStageToClean, serviceDate, clientId } = req.body;
  
    const requestedDate = new Date(new Date(serviceDate).setHours(0, 0, 0, 0)); // Réinitialise l'heure pour la date demandée à minuit
    const today = new Date(new Date().setHours(0, 0, 0, 0));
  
    // Définir une expiration de 30 minutes à partir de maintenant
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 30);
  
    try {
      // Vérifier si la date de service demandée est dans le passé ou aujourd'hui
      if (requestedDate <= today) {
        return res.status(400).json({ message: 'The service date cannot be in the past or today.' });
      }
  
      // Vérifier si la date est déjà réservée
      const reservationsRef = db.collection('reservations');
      const querySnapshot = await reservationsRef.where('serviceDate', '==', requestedDate).get();
  
      if (!querySnapshot.empty) {
        return res.status(400).json({ message: 'This service date is already booked.' });
      }
  
      // Création du document de réservation dans Firestore
      const reservationRef = await db.collection('reservations').add({
        areaSize,
        fruitsBasketSelected,
        nbrOfStageToClean,
        expirationDate,
        serviceDate: requestedDate, // Utilisation de requestedDate qui est déjà un objet Date
        clientId,
        status: "pending",
        createdAt: new Date() // Date de création de la réservation
      });
  
      res.status(201).json({ message: 'Reservation created successfully with expiration', reservationId: reservationRef.id, validUntil: expirationDate });
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ error: 'Failed to create reservation' });
    }
  };


const getReservedDates = async (req, res) => {
  try {
    const reservationsSnapshot = await db.collection('reservations').get();
    const reservedDates = [];
    reservationsSnapshot.forEach(doc => {
        const reservationData = doc.data();
        // Convertir l'objet Timestamp en objet Date, puis en chaîne ISO
        const serviceDate = reservationData.serviceDate.toDate().toISOString().split('T')[0];
        reservedDates.push(serviceDate);
      });
    res.status(200).json(reservedDates);
  } catch (error) {
    console.error("Error fetching reserved dates: ", error);
    res.status(500).json({ message: "Failed to fetch reserved dates" });
  }
};


module.exports = {
  createReservation,
  getReservedDates
};
