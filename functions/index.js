/* eslint-disable linebreak-style */
/* eslint-disable max-len */
const functions = require("firebase-functions");
const SibApiV3Sdk = require("sib-api-v3-sdk");
// Configurez le client Sendinblue
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = functions.config().sendinblue.key;
const {admin} = require("./firebaseFunctionsConfig");

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const formatSizeRange = (sizeRange) => {
  switch (sizeRange) {
    case "lessThan40":
      return "Moins de 40m²";
    case "from40to80":
      return "Entre 40m² et 80m²";
    case "from80to120":
      return "Entre 80m² et 120m²";
    case "moreThan120":
      return "Plus de 120m²";
    default:
      return sizeRange;
  }
};

exports.sendEmailConfirmation = functions.firestore
    .document("reservations/{reservationId}")
    .onCreate((snap, context) => {
      const reservationData = snap.data();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // Créez l'objet e-mail

      sendSmtpEmail.sender = {email: "sahel@example.com", name: "Sahel"};
      sendSmtpEmail.to = [{email: "hahaddaoui@gmail.com"}];
      sendSmtpEmail.subject = "Confirmation de votre réservation";
      sendSmtpEmail.htmlContent = `<html lang="fr">
      <head>
      <meta charset="UTF-8">
      <title>Confirmation de Réservation</title>
      <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
          table { width: 100%; max-width: 600px; margin: auto; background-color: white; }
          .header { background-color: #ac5f40; color: white; padding: 10px; text-align: center; }
          .content { padding: 20px; }
          img { margin-bottom: 10px; }
          p { color: #666666; margin-top: 10px; margin-bottom: 10px; }
          .info { margin-bottom: 5px; }
          .bold { font-weight: bold; }
          .container { display: flex; flex-direction: column; align-items: center;}
      </style>
  </head>
  <body>
      <div class="container">
        <div><img src="https://firebasestorage.googleapis.com/v0/b/sahel-26e16.appspot.com/o/Logo%20Sahel%2FLogo-2-copie.webp?alt=media&token=680b09ce-3ff0-4780-b99a-52b4edda2c1f" width="200" alt="Logo Sahel"></div>
        <table border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td class="header">
                    <h1>Confirmation de Réservation</h1>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <p>Bonjour ${reservationData.firstName},</p>
                    <p>Votre réservation pour le <span class="bold">${reservationData.serviceDate}</span> a été confirmée. Voici les détails de votre réservation :</p>
                    <p class="info"><span class="bold">Nombre d'étages :</span> ${reservationData.formData.numberOfFloors}</p>
                    <p class="info"><span class="bold">Surface :</span> ${formatSizeRange(reservationData.formData.sizeRange)}</p>
                    <p class="info"><span class="bold">Panier de fruits :</span> ${reservationData.formData.fruitBasketSelected ? "oui" : "non"}</p>
                    <p class="info"><span class="bold">Le nettoyage sera fait ${reservationData.formData.beforeOrAfter === "Before" ? "avant" : "après"} votre arrivée</p>
                    <p class="info"><span class="bold">Adresse de la prestation :</span> ${reservationData.bookingFormData.address} - ${reservationData.bookingFormData.city}</p>
                    ${reservationData.bookingFormData.specialInstructions ? `<p class="info"><span class="bold">Instructions spéciales :</span> ${reservationData.bookingFormData.specialInstructions}</p>` : ""}
                    <p class="info"><span class="bold">TOTAL TTC :</span> ${reservationData.quote}€</p>
                </td>
            </tr>
        </table>
      </div>
  </body>
          `;

      apiInstance.sendTransacEmail(sendSmtpEmail).then((data) => {
        console.log("Email sent successfully");
      }, (error) => {
        console.error("Failed to send email:", error);
      });
    });

exports.updateReservationStatus = functions.pubsub.schedule("every 6 hours").onRun((context) => {
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
