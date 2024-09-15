const express = require('express');
const { getReservedDates, getReservationsByUser, createPreDemand } = require('../controllers/reservationController'); // Assurez-vous que ce chemin correspond à votre structure de fichier
const getUserDataAndVerifyToken = require('../middleware/authMiddleware');
const router = express.Router();

// Route pour créer une nouvelle réservation

// router.post('/reservations',  createReservation);
router.get('/reserved-dates', getReservedDates);
router.get('/mes-reservations',  getReservationsByUser)
router.post('/create-pre-demand',  createPreDemand);

module.exports = router;
