const express = require('express');
const { calculateQuote } = require('../controllers/quoteController');
const router = express.Router();

router.post('/quote', calculateQuote);

module.exports = router;