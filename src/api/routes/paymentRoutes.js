// routes.js ou un fichier similaire
const express = require('express');
const { createPayment, verifyPayment } = require('../controllers/paymentController');
const router = express.Router();

router.post('/create-payment', createPayment);

router.post('/check-payment-intent', verifyPayment)

module.exports = router;