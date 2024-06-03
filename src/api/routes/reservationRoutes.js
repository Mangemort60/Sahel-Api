const express = require('express');
const { createReservation, getReservedDates, getReservationsByUser } = require('../controllers/reservationController'); // Assurez-vous que ce chemin correspond à votre structure de fichier
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getUserDataAndVerifyToken } = require('../controllers/authController');

// Route pour créer une nouvelle réservation

// router.post('/reservations',  createReservation);
router.get('/reserved-dates', getReservedDates);
router.get('/mes-reservations',  getReservationsByUser)

module.exports = router;
