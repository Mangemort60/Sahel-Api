const { db } = require('../../config/firebaseConfig'); // Assurez-vous que ce chemin correspond à votre configuration Firebase
const reservationSchema = require('../../models/reservationModel')
const daysjs = require('dayjs')

const createReservation = async (req, res) => {
  const reservationData = req.body;

  // Valider les données reçues
  const { error } = reservationSchema.validate(reservationData);
  if (error) {
    return res.status(400).json({ message: 'Validation error', details: error.details });
  }

  // Créer un objet dayjs à partir de serviceDate au format DD-MM-YYYY pour la comparaison
  const formattedRequestedDate = daysjs(reservationData.serviceDate, 'DD-MM-YYYY');
  const today = daysjs().startOf('day'); // Utiliser startOf('day') pour ignorer l'heure

  if (!formattedRequestedDate.isAfter(today)) {
    return res.status(400).json({ message: 'The service date cannot be in the past or today.' });
  }

  try {
    const reservationsRef = db.collection('reservations');
    // Pas besoin de reformater la date, utiliser directement reservationData.serviceDate
    const querySnapshot = await reservationsRef.where('serviceDate', '==', reservationData.serviceDate).get();

    console.log(querySnapshot);
    
    if (querySnapshot.size >= 3) {
      return res.status(400).json({ message: 'This service date has reached the booking limit.' });
    }

    // Ajouter la réservation avec serviceDate déjà au format DD-MM-YYYY
    const reservationRef = await reservationsRef.add(reservationData);

    res.status(201).json({ message: 'Reservation created successfully', reservationId: reservationRef.id });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
};



  const getReservedDates = async (req, res) => {
    try {
      const reservationsSnapshot = await db.collection('reservations').get();
  
      if (reservationsSnapshot.empty) {
        // Renvoyer un tableau vide si aucune réservation n'est trouvée
        return res.status(200).json([]);
      }

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

  
  const getReservationsByUser = async (req, res) => {
    try {

      const shortID = req.query.shortID;
      console.log("shortID " ,shortID);
  
      if (!shortID) {
        return res.status(400).json({ error: 'ID utilisateur non disponible.' });
      }
  

      const reservations = [];
      const snapshot = await db.collection('reservations').where('shortId', '==', shortID).get();
  
      if (snapshot.empty) {
        return res.status(404).json({ error: 'Aucune réservation trouvée pour cet utilisateur.' });
      }
  
      snapshot.forEach(doc => {
        reservations.push({ id: doc.id, ...doc.data() });
      });
  
      res.status(200).json(reservations);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  };
   
module.exports = {
  createReservation,
  getReservedDates, 
  getReservationsByUser,
};
