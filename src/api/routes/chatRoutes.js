// routes/chatRoutes.js
const express = require('express');
const { getMessages, sendMessage } = require('../controllers/chatController');
const multer = require('multer');

const upload = multer(); // Configuration de multer pour les fichiers en mémoire
const router = express.Router();

router.get('/reservations/:reservationId/messages', getMessages);
router.post('/reservations/:reservationId/messages', upload.array('files'), sendMessage);

module.exports = router;
