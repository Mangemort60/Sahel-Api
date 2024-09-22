// routes/chatRoutes.js
const express = require('express');
const { getMessages, sendMessage, getNewMessages, markMessagesAsReadByAgent, markMessagesAsReadByClient,  toggleChatStatus, getAllMessages } = require('../controllers/chatController');
const multer = require('multer');

const upload = multer({
    limits: {
      fileSize: 10 * 1024 * 1024, // Limite à 10MB
    },
  });
const router = express.Router();

router.get('/reservations/:userId/messages', getAllMessages)
router.get('/reservations/:reservationId/messages', getMessages);
router.post('/reservations/:reservationId/messages', upload.array('files'), sendMessage);
router.get('/new-messages', getNewMessages);
router.put('/reservations/:reservationId/messages/read-by-agent', markMessagesAsReadByAgent);
router.put('/reservations/:reservationId/messages/read-by-client', markMessagesAsReadByClient);
router.post('/reservations/:reservationId/toggleChatStatus', toggleChatStatus);

module.exports = router;
