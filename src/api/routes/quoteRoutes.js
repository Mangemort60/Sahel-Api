const express = require('express');
const {  calculateCleaningQuote, calculateCookingQuote } = require('../controllers/quoteController');
const router = express.Router();

router.post('/cleaning-quote', calculateCleaningQuote);
router.post('/cooking-quote', calculateCookingQuote);


module.exports = router;