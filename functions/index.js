/* eslint-disable linebreak-style */
/* eslint-disable max-len */
require("dotenv").config();

const functions = require("firebase-functions");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const SibApiV3Sdk = require("sib-api-v3-sdk");
// Configurez le client Sendinblue
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_KEY || functions.config().sendinblue.key;

const {admin} = require("./firebaseFunctionsConfig");
const {logger} = require("firebase-functions");

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

// Envoi un email de confirmation au client lorsqu'il prend sa réservation

exports.sendEmailConfirmation = functions.firestore
    .document("reservations/{reservationId}")
    .onCreate(async (snap, context) => {
      const reservationData = snap.data();
      const reservationId = context.params.reservationId;


      console.log(`Function triggered for reservationId: ${reservationId}`);
      console.log("RESERVATION EMAIL", reservationData.email);

      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

      // Envoyer l'email de confirmation si pas déjà envoyé
      if (!reservationData.emails.confirmationEmailSent) {
        console.log("reservation email :", reservationData.email);
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = {email: "sahel@example.com", name: "Sahel"};
        sendSmtpEmail.to = [{email: reservationData.email}];
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
        </html>
        `;

        try {
          console.log(`Sending confirmation email to: ${reservationData.email}`);
          await apiInstance.sendTransacEmail(sendSmtpEmail);
          console.log("Confirmation email sent successfully");

          // Mettre à jour le document pour marquer l'email de confirmation comme envoyé
          await admin.firestore().collection("reservations").doc(reservationId).update({
            "emails.confirmationEmailSent": true,
          });
          console.log(`Updated reservationId: ${reservationId} with confirmationEmailSent: true`);
        } catch (error) {
          console.error("Failed to send confirmation email:", error);
        }
      } else {
        console.log(`Confirmation email already sent for reservationId: ${reservationId}`);
      }

      // Envoyer l'email d'instructions pour les clés si applicable et pas déjà envoyé
      if (reservationData.formData.beforeOrAfter === "before" && !reservationData.emails.instructionsKeysEmailSent) {
        const sendKeysEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendKeysEmail.sender = {email: "sahel@example.com", name: "Sahel"};
        sendKeysEmail.to = [{email: reservationData.email}];
        sendKeysEmail.subject = "Instructions pour la remise des clés";
        sendKeysEmail.htmlContent = `<html lang="fr">
        <head>
        <meta charset="UTF-8">
        <title>Instructions pour la Remise des Clés</title>
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
                            <h1>Instructions pour la Remise des Clés</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
                            <p>Bonjour ${reservationData.firstName},</p>
                            <p>Vous avez choisi de transmettre les clés de votre logement pour que le ménage soit effectué avant votre arrivée. Voici les instructions pour la remise des clés :</p>
                            <p class="info">[Insérez ici les instructions spécifiques pour la remise des clés]</p>
                        </td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
        `;

        try {
          console.log(`Sending keys instructions email to: ${reservationData.email}`);
          await apiInstance.sendTransacEmail(sendKeysEmail);
          console.log("Keys instructions email sent successfully");

          // Mettre à jour le document pour marquer l'email d'instructions pour les clés comme envoyé
          await admin.firestore().collection("reservations").doc(reservationId).update({
            "emails.instructionsKeysEmailSent": true,
          });
          console.log(`Updated reservationId: ${reservationId} with instructionsKeysEmailSent: true`);
        } catch (error) {
          console.error("Failed to send keys instructions email:", error);
        }
      } else if (reservationData.formData.beforeOrAfter === "before") {
        console.log(`Keys instructions email already sent for reservationId: ${reservationId}`);
      }

      // Envoyer l'email d'instructions par défaut si applicable et pas déjà envoyé
      if (reservationData.formData.beforeOrAfter !== "before" && !reservationData.emails.defaultInstructionsEmailSent) {
        const sendDefaultInstructionsEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendDefaultInstructionsEmail.sender = {email: "sahel@example.com", name: "Sahel"};
        sendDefaultInstructionsEmail.to = [{email: reservationData.email}];
        sendDefaultInstructionsEmail.subject = "Instructions par défaut";
        sendDefaultInstructionsEmail.htmlContent = `<html lang="fr">
        <head>
        <meta charset="UTF-8">
        <title>Instructions par Défaut</title>
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
                            <h1>Instructions par Défaut</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
                            <p>Bonjour ${reservationData.firstName},</p>
                            <p>Voici les instructions pour votre réservation :</p>
                            <p class="info">[Insérez ici les instructions par défaut]</p>
                        </td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
        `;

        try {
          console.log(`Sending default instructions email to: ${reservationData.email}`);
          await apiInstance.sendTransacEmail(sendDefaultInstructionsEmail);
          console.log("Default instructions email sent successfully");

          // Mettre à jour le document pour marquer l'email d'instructions par défaut comme envoyé
          await admin.firestore().collection("reservations").doc(reservationId).update({
            "emails.defaultInstructionsEmailSent": true,
          });
          console.log(`Updated reservationId: ${reservationId} with defaultInstructionsEmailSent: true`);
        } catch (error) {
          console.error("Failed to send default instructions email:", error);
        }
      } else if (reservationData.formData.beforeOrAfter !== "Before") {
        console.log(`Default instructions email already sent for reservationId: ${reservationId}`);
      }
    });

// passe le statut de la réservation "à venir" à "en cours " le jour de la préstation

exports.updateReservationStatus = onSchedule("every 6 hours", async (event) => {
  const currentDate = new Date();
  logger.info("updateReservationStatus function triggered at: ", currentDate.toISOString());

  const today = new Date();
  const dateString = `${today.getDate().toString().padStart(2, "0")}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getFullYear()}`;

  logger.info("Filtering reservations with date:", dateString);

  try {
    const snapshot = await admin.firestore().collection("reservations")
        .where("serviceDate", "==", dateString)
        .where("serviceStatus", "==", "à venir")
        .get();

    logger.info(`Found ${snapshot.size} reservations to update`);

    const updates = [];
    snapshot.forEach((doc) => {
      logger.info(`Updating reservation ${doc.id}`);
      updates.push(doc.ref.update({serviceStatus: "en cours"}));
    });

    await Promise.all(updates);
    logger.info("Updated reservations successfully");
  } catch (error) {
    logger.error("Error updating reservations", error);
    throw new Error("Error updating reservations");
  }
});
// Fonction pour envoyer un email lorsque keyReceived est mis à jour à true
exports.sendEmailOnKeyReceived = functions.firestore
    .document("reservations/{reservationId}")
    .onUpdate((change, context) => {
      const newValue = change.after.data();
      const previousValue = change.before.data();

      // Vérifiez si keyReceived est passé de false à true
      if (!previousValue.keyReceived && newValue.keyReceived) {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.sender = {email: "sahel@example.com", name: "Sahel"};
        sendSmtpEmail.to = [{email: newValue.email}]; // Assurez-vous que l'email du client est bien stocké dans reservationData
        sendSmtpEmail.subject = "Clés reçues";
        sendSmtpEmail.htmlContent = `<html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Confirmation de Réception des Clés</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
            table { width: 100%; max-width: 600px; margin: auto; background-color: white; }
            .header { background-color: #ac5f40; color: white; padding: 10px; text-align: center; }
            .content { padding: 20px; }
            p { color: #666666; margin-top: 10px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div>
            <table border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td class="header">
                  <h1>Confirmation de Réception des Clés</h1>
                </td>
              </tr>
              <tr>
                <td class="content">
                  <p>Bonjour ${newValue.firstName},</p>
                  <p>Nous confirmons la réception de vos clés pour votre réservation prévue le <strong>${newValue.serviceDate}</strong>.</p>
                  <p>Merci de votre confiance.</p>
                  <p>Cordialement,</p>
                  <p>L'équipe Sahel</p>
                </td>
              </tr>
            </table>
          </div>
        </body>
      </html>`;

        apiInstance.sendTransacEmail(sendSmtpEmail).then((data) => {
          console.log("Email sent successfully");
        }, (error) => {
          console.error("Failed to send email:", error);
        });
      }
    });
