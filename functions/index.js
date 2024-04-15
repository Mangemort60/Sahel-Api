/* eslint-disable max-len */
const functions = require("firebase-functions");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const dayJs = require("dayjs");
// Configurez le client Sendinblue
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = functions.config().sendinblue.key;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

exports.sendEmailConfirmation = functions.firestore
    .document("reservations/{reservationId}")
    .onCreate((snap, context) => {
      const reservationData = snap.data();
      const serviceDateFormated = dayJs(reservationData.serviceDate).format("DD-MM-YYYY");
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // Créez l'objet e-mail

      sendSmtpEmail.sender = {email: "sahel@example.com", name: "Your Company Name"};
      sendSmtpEmail.to = [{email: "hahaddaoui@gmail.com"}];
      sendSmtpEmail.subject = "Confirmation de votre réservation";
      sendSmtpEmail.htmlContent = `<html><body><h1>Confirmation de Réservation</h1><p>Bonjour ${reservationData.firstName}, votre réservation pour ${serviceDateFormated} a été confirmée.</p></body></html>`;

      apiInstance.sendTransacEmail(sendSmtpEmail).then((data) => {
        console.log("Email sent successfully");
      }, (error) => {
        console.error("Failed to send email:", error);
      });
    });
