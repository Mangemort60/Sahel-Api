/* eslint-disable max-len */
const functions = require("firebase-functions");
const SibApiV3Sdk = require("sib-api-v3-sdk");
// Configurez le client Sendinblue
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = functions.config().sendinblue.key;
const {admin} = require("./firebaseFunctionsConfig");

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

exports.sendEmailConfirmation = functions.firestore
    .document("reservations/{reservationId}")
    .onCreate((snap, context) => {
      const reservationData = snap.data();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // Créez l'objet e-mail

      sendSmtpEmail.sender = {email: "sahel@example.com", name: "Your Company Name"};
      sendSmtpEmail.to = [{email: "hahaddaoui@gmail.com"}];
      sendSmtpEmail.subject = "Confirmation de votre réservation";
      sendSmtpEmail.htmlContent = `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    h1 { color: #333366; }
    p { color: #666666; }
  </style>
</head>
<body>
  <h1>Confirmation de Réservation - NEW TEMPLATE</h1>
  <p>Bonjour ${reservationData.firstName}, votre réservation pour le ${reservationData.serviceDate} a été confirmée.</p>
</body>
</html>`;

      apiInstance.sendTransacEmail(sendSmtpEmail).then((data) => {
        console.log("Email sent successfully");
      }, (error) => {
        console.error("Failed to send email:", error);
      });
    });

exports.updateReservationStatus = functions.pubsub.schedule("every 1 minutes").onRun((context) => {
  const today = new Date();
  const dateString = `${today.getDate().toString().padStart(2, "0")}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getFullYear()}`;

  return admin.firestore().collection("reservations")
      .where("serviceDate", "==", dateString)
      .where("serviceStatus", "==", "à venir")
      .get()
      .then((snapshot) => {
        const updates = [];
        snapshot.forEach((doc) => {
          updates.push(doc.ref.update({serviceStatus: "en cours"}));
        });
        return Promise.all(updates);
      })
      .then(() => console.log("Updated reservations successfully"))
      .catch((error) => console.error("Error updating reservations", error));
});
