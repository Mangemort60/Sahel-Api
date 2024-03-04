const express = require('express');
const { createReservation, getReservedDates } = require('../controllers/reservationController'); // Assurez-vous que ce chemin correspond à votre structure de fichier
const router = express.Router();

// Route pour créer une nouvelle réservation
router.post('/reservations', createReservation);
router.get('/reserved-dates', getReservedDates);

module.exports = router;
