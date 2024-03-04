const { db } = require('../../config/firebaseConfig'); // Assurez-vous que ce chemin correspond à votre configuration Firebase

// Fonction pour créer une nouvelle réservation
const createReservation = async (req, res) => {
  const { areaSize, fruitsBasketSelected, nbrOfStageToClean, serviceDate, clientId } = req.body;

  try {
    // Vérifier si la date est déjà réservée
    const reservationsRef = db.collection('reservations');
    const querySnapshot = await reservationsRef.where('serviceDate', '==', new Date(serviceDate)).get();

    if (!querySnapshot.empty) {
        return res.status(400).json({ message: 'This service date is already booked.' });
    }
    // Création du document de réservation dans Firestore
    const reservationRef = await db.collection('reservations').add({
      areaSize,
      fruitsBasketSelected,
      nbrOfStageToClean,
      serviceDate: new Date(serviceDate), // Convertit la chaîne de caractères en objet Date
      clientId,
      createdAt: new Date() // Date de création de la réservation
    });

    res.status(201).json({ message: 'Reservation created successfully', reservationId: reservationRef.id });
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
