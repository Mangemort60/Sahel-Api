const express = require('express');
const router = express.Router();
const { cleanupReservations } = require('../controllers/cleanUpController');

router.get('/cleanup-reservations', cleanupReservations);

module.exports = router;