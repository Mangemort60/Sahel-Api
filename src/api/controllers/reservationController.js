const { db } = require('../../config/firebaseConfig'); // Assurez-vous que ce chemin correspond à votre configuration Firebase
const reservationSchema = require('../../models/reservationModel')

// Fonction pour créer une nouvelle réservation
const createReservation = async (req, res) => {
  const reservationData = req.body;

  // Valider les données reçues
  const { error } = reservationSchema.validate(reservationData);
  if (error) {
    return res.status(400).json({ message: 'Validation error', details: error.details });
  }

  // Extraire et convertir serviceDate en format YYYY-MM-DD
  const requestedDate = new Date(reservationData.serviceDate);
  const requestedDateString = requestedDate.toISOString().split('T')[0];

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  try {
    if (requestedDateString <= todayString) {
      return res.status(400).json({ message: 'The service date cannot be in the past or today.' });
    }

    const reservationsRef = db.collection('reservations');
    // Utilisez le format YYYY-MM-DD pour la comparaison
    const querySnapshot = await reservationsRef.where('serviceDate', '==', requestedDateString).get();

    if (querySnapshot.size >= 3) {
      return res.status(400).json({ message: 'This service date has reached the booking limit.' });
    }

    // Ajoutez la réservation avec serviceDate au format YYYY-MM-DD
    const reservationRef = await reservationsRef.add({
      ...reservationData,
      serviceDate: requestedDateString
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
      const reservationCounts = {};
  
      reservationsSnapshot.forEach(doc => {
        const { serviceDate } = doc.data();
        if (reservationCounts[serviceDate]) {
          reservationCounts[serviceDate] += 1;
        } else {
          reservationCounts[serviceDate] = 1;
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
