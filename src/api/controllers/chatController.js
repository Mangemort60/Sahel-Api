require("dotenv").config();
const { db,bucket, FieldValue } = require('../../config/firebaseConfig');
const { v4: uuidv4 } = require('uuid');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const { log } = require("firebase-functions/logger");

// Configure SendInBlue
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_KEY || functions.config().sendinblue.key;
// Remplacez par votre clé API SendInBlue

exports.getAllMessages = async (req, res) => {
  const { userId } = req.params;

  try {
    // Récupérer toutes les réservations associées à l'utilisateur
    const reservationsSnapshot = await db
      .collection('reservations')
      .where('shortId', '==', userId)
      .get();

    // Initialiser un objet pour stocker les messages groupés par reservationId
    let groupedMessages = {};

    // Parcourir les documents de réservation pour récupérer les messages
    reservationsSnapshot.docs.forEach(doc => {
      const reservationData = doc.data();
      const reservationId = doc.id; // L'ID de la réservation

      // Vérifier si la réservation contient des messages
      if (reservationData.messages && Array.isArray(reservationData.messages)) {
        // Ajouter les messages au groupe basé sur l'ID de la réservation
        groupedMessages[reservationId] = reservationData.messages;
      }
    });

    // Renvoyer les messages groupés par reservationId
    res.json(groupedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Error fetching messages');
  }
};



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
    const { sender, text, role, clientEmail } = req.body;
    let attachmentUrls = [];
    let attachmentTypes = [];
  
    // Traiter les fichiers téléchargés
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const fileName = `${uuidv4()}_${file.originalname}`;
        const filePath = `chatPhotos/${fileName}`;  // Spécifiez le chemin complet dans Firebase Storage
        const fileUpload = bucket.file(filePath);
        await fileUpload.save(file.buffer);
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
        attachmentUrls.push(publicUrl);
        attachmentTypes.push(file.mimetype);      }
    }
  
    try {
      console.log("clientEmail ", clientEmail);
      const message = {
        sender,
        clientEmail,
        text,
        role,
        attachments: attachmentUrls.map((url, index) => ({
        url,
        type: attachmentTypes[index]
      })), // Stocker les URLs et les types MIME des pièces jointes        created: new Date().toISOString(),
        readByClient: false,
        readByAgent: false
      };
      await db.collection('reservations').doc(reservationId).update({
        messages: FieldValue.arrayUnion(message)
      });

        // Si l'utilisateur est admin ou superAdmin, envoyer un email au client
        if (role === 'admin' || role === 'superAdmin') {
          const reservationDoc = await db.collection('reservations').doc(reservationId).get();
          // const clientEmail = reservationData.clientEmail;  // Assurez-vous que l'email du client est stocké dans les données de réservation

          const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

          const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

          sendSmtpEmail.to = [{ email: clientEmail }];
          sendSmtpEmail.sender = { email: 'sahel@example.com', name: 'Sahel' };  // Remplacez par votre email et nom
          sendSmtpEmail.subject = 'Vous avez reçu une réponse de l\'administrateur';
          sendSmtpEmail.textContent = `Bonjour,

Vous avez reçu une nouvelle réponse de notre équipe. Veuillez accéder à votre espace client pour consulter le message.

Merci,
Votre équipe`;

          await apiInstance.sendTransacEmail(sendSmtpEmail);
      }
      return res.status(200).send({ message: 'Message sent successfully', attachmentsUrls: attachmentUrls, attachmentTypes: attachmentTypes });
    } catch (error) {
      return res.status(500).send('Error sending message: ' + error.message);
    }
  
 };

 exports.getNewMessages = async (req, res) => {
  try {
    const reservationsSnapshot = await db.collection('reservations').get();
    const newMessages = [];

    reservationsSnapshot.forEach((reservationDoc) => {
      const reservationData = reservationDoc.data();
      const messages = reservationData.messages || [];

      messages.forEach((message) => {
        if (!message.read) {
          newMessages.push({
            reservationId: reservationDoc.id,
            ...message,
          });
        }
      });
    });

    res.status(200).json(newMessages);
  } catch (error) {
    console.error('Error fetching new messages:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.markMessagesAsReadByAgent = async (req, res) => {
  const { reservationId } = req.params;
  try {
    const reservationRef = db.collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      return res.status(404).send('Reservation not found');
    }

    const reservationData = reservationDoc.data();
    const messages = reservationData.messages || []; // Initialisez à un tableau vide si indéfini

    const updatedMessages = messages.map((message) => {
      if (!message.readByAgent) {
        message.readByAgent = true;
      }
      return message;
    });

    await reservationRef.update({ messages: updatedMessages });

    res.status(200).send('Messages marked as read by agent');
  } catch (error) {
    console.error('Error updating messages:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.markMessagesAsReadByClient = async (req, res) => {
  const { reservationId } = req.params;
  try {
    const reservationRef = db.collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      return res.status(404).send('Reservation not found');
    }

    const reservationData = reservationDoc.data();
    const messages = reservationData.messages || []; // Initialisez à un tableau vide si indéfini

    const updatedMessages = messages.map((message) => {
      if (!message.readByClient) {
        message.readByClient = true;
      }
      return message;
    });

    await reservationRef.update({ messages: updatedMessages });

    res.status(200).send('Messages marked as read by client');
  } catch (error) {
    console.error('Error updating messages:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.toggleChatStatus = async (req, res) => {
  const { reservationId } = req.params;

  try {
    const reservationRef = db.collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      return res.status(404).send('Reservation not found');
    }

    // Récupérer le statut actuel du chat
    const currentStatus = reservationDoc.data().chatStatus;

    // Basculer le statut du chat
    const newStatus = !currentStatus;

    // Mettre à jour le champ chatStatus de la réservation
    await reservationRef.update({ chatStatus: newStatus });

    return res.status(200).send({ message: 'Chat status updated successfully', chatStatus: newStatus });
  } catch (error) {
    console.error('Error updating chat status:', error);
    return res.status(500).send('An error occurred while updating the chat status');
  }
};