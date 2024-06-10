const { db,bucket, FieldValue } = require('../../config/firebaseConfig');
const { v4: uuidv4 } = require('uuid');


// Récupérer les messages d'une réservation
exports.getMessages = async (req, res) => {
    const { reservationId } = req.params;
    try {
      const reservationDoc = await db.collection('reservations').doc(reservationId).get();
      if (!reservationDoc.exists) {
        return res.status(404).send('Reservation not found');
      }
      const reservationData = reservationDoc.data();
      return res.status(200).json(reservationData.messages || []);
    } catch (error) {
      return res.status(500).send('Error fetching messages: ' + error.message);
    }
  };
  
// Envoyer un nouveau message avec pièces jointes
exports.sendMessage = async (req, res) => {
    const { reservationId } = req.params;
    const { sender, text } = req.body;
    let attachmentUrls = [];
  
    // Traiter les fichiers téléchargés
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const fileName = `${uuidv4()}_${file.originalname}`;
        const fileUpload = bucket.file(fileName);
        await fileUpload.save(file.buffer);
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        attachmentUrls.push(publicUrl);
      }
    }
  
    try {
      const message = {
        sender,
        text,
        attachments: attachmentUrls, // Stocker les URLs des pièces jointes
        created: new Date().toISOString()
      };
      await db.collection('reservations').doc(reservationId).update({
        messages: FieldValue.arrayUnion(message)
      });
      return res.status(200).send('Message sent successfully');
    } catch (error) {
      return res.status(500).send('Error sending message: ' + error.message);
    }
  
 };