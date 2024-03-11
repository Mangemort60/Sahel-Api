const { db } = require('../../config/firebaseConfig'); // Assurez-vous que ce chemin correspond à votre configuration Firebase
const reservationSchema = require('../../models/reservationModel')

// Fonction pour créer une nouvelle réservation
const createReservation = async (req, res) => {
  const { areaSize, fruitsBasketSelected, nbrOfStageToClean, serviceDate, clientId, address, addressComplement, phoneNumber, specialInstructions, shortId } = req.body;
   
    // Valider les données reçues
    const { error, value } = reservationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Validation error', details: error.details });
    }
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
  
      if (querySnapshot.size >= 3) {
        return res.status(400).json({ message: 'This service date has reached the booking limit.' });
      }
  
      // Création du document de réservation dans Firestore
      const reservationRef = await db.collection('reservations').add({
        areaSize,
        fruitsBasketSelected,
        nbrOfStageToClean,
        expirationDate,
        serviceDate: requestedDate,
        clientId,
        address, // Assurez-vous d'ajouter ces champs à votre base de données
        addressComplement,
        phoneNumber,
        specialInstructions,
        status: "pending",
        createdAt: new Date(),
        shortId: shortId
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
      const reservationCounts = {};
  
      reservationsSnapshot.forEach(doc => {
        const { serviceDate } = doc.data();
        const dateStr = serviceDate.toDate().toISOString().split('T')[0];
        if (reservationCounts[dateStr]) {
          reservationCounts[dateStr] += 1;
        } else {
          reservationCounts[dateStr] = 1;
        }
      });
  
      const countsAsArray = Object.entries(reservationCounts).map(([date, count]) => ({
        date,
        count
      }));
  
      res.status(200).json(countsAsArray);
    } catch (error) {
      console.error("Error fetching reservation counts: ", error);
      res.status(500).json({ message: "Failed to fetch reservation counts" });
    }
  };
  


module.exports = {
  createReservation,
  getReservedDates
};
