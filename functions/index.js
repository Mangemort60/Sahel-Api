/* eslint-disable linebreak-style */
/* eslint-disable max-len */
require("dotenv").config();

const functions = require("firebase-functions");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const SibApiV3Sdk = require("sib-api-v3-sdk");
// Configurez le client Sendinblue
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_KEY || functions.config().sendinblue.key;

const { admin } = require("./firebaseFunctionsConfig");
const { logger } = require("firebase-functions");

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
      sendSmtpEmail.sender = { email: "hahaddaoui@gmail.com", name: "Sahel" };
      sendSmtpEmail.to = [{ email: reservationData.email }];
      sendSmtpEmail.subject = "Confirmation de votre réservation";
      sendSmtpEmail.htmlContent = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title> Confirmation de Réservation </title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    p {
      display: block;
      margin: 13px 0;
    }
  </style>
  <!--[if mso]>
        <noscript>
        <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        </noscript>
        <![endif]-->
  <!--[if lte mso 11]>
        <style type="text/css">
          .mj-outlook-group-fix { width:100% !important; }
        </style>
        <![endif]-->
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
  </style>
  <!--<![endif]-->
  <style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    }
  </style>
  <style media="screen and (min-width:480px)">
    .moz-text-html .mj-column-per-100 {
      width: 100% !important;
      max-width: 100%;
    }
  </style>
  <style type="text/css">
    @media only screen and (max-width:480px) {
      table.mj-full-width-mobile {
        width: 100% !important;
      }

      td.mj-full-width-mobile {
        width: auto !important;
      }
    }
  </style>
</head>

<body style="word-spacing:normal;background-color:#ffffff;">
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;"> Votre réservation est confirmée </div>
  <div style="background-color:#ffffff;">
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:10px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:580px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                          <tbody>
                            <tr>
                              <td style="width:200px;">
                                <a href="https://sahel-26e16.web.app/" target="_blank">
                                  <img alt="sahel logo" height="auto" src="https://firebasestorage.googleapis.com/v0/b/sahel-26e16.appspot.com/o/Logo%20Sahel%2FLogo-2-copie.png?alt=media&token=da1022cf-4416-4e78-8318-f053c25ee650" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="200" />
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size:0px;padding:20px 0 10px 0;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:24px;font-weight:bold;line-height:1;text-align:center;color:#1d1c1d;">Réservation confirmée</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#666666;">Bonjour ${reservationData.firstName},<br /> Merci pour votre réservation avec Sahel ! <br /> Votre réservation pour le <strong>${reservationData.serviceDate}</strong> a été confirmée.</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#f5f4f5" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#f5f4f5;background-color:#f5f4f5;margin:0px auto;border-radius:8px;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f4f5;background-color:#f5f4f5;width:100%;border-radius:8px;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:10px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:580px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 0;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:1;text-align:left;color:#000000;">Détails de votre réservation</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:5px 0;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#666666;"><strong>Nombre d'étages :</strong> ${reservationData.numberOfFloors}<br />
                          <strong>Surface :</strong> ${formatSizeRange(reservationData.sizeRange)}<br />
                          <strong>Le nettoyage sera fait :</strong> ${reservationData.beforeOrAfter === "after" ? "après" : "avant"} votre arrivée<br />
                          <strong>Lieu de la prestation :</strong> ${reservationData.address}<br />
                          <strong>Montant total de la prestation :</strong> <span style="font-weight:700;">${reservationData.quote} €</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
    <!-- Section pour les logos sociaux -->
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:10px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:580px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" ><tr><td><![endif]-->
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;">
                          <tr>
                            <td style="padding:4px;vertical-align:middle;">
                              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#3b5998;border-radius:3px;width:30px;">
                                <tr>
                                  <td style="font-size:0;height:30px;vertical-align:middle;width:30px;">
                                    <a href="https://www.facebook.com/sharer/sharer.php?u=https://mjml.io/" target="_blank">
                                      <img height="30" src="https://www.mailjet.com/images/theme/v1/icons/ico-social/facebook.png" style="border-radius:3px;display:block;" width="30" />
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!--[if mso | IE]></td><td><![endif]-->
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;">
                          <tr>
                            <td style="padding:4px;vertical-align:middle;">
                              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#0077b5;border-radius:3px;width:30px;">
                                <tr>
                                  <td style="font-size:0;height:30px;vertical-align:middle;width:30px;">
                                    <a href="https://www.linkedin.com/shareArticle?mini=true&url=https://linkedin.com&title=&summary=&source=" target="_blank">
                                      <img height="30" src="https://firebasestorage.googleapis.com/v0/b/sahel-26e16.appspot.com/o/Logo%20Sahel%2Flinkedin.png?alt=media&token=1aa05e17-3146-4726-9981-3bdc5636224c" style="border-radius:3px;display:block;" width="30" />
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!--[if mso | IE]></td></tr></table><![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
  </div>
</body>

</html>`;

      try {
        console.log(`Sending confirmation email to: ${reservationData.email}`);
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Confirmation email sent successfully");

        // Mettre à jour le document pour marquer l'email de confirmation comme envoyé
        await admin
          .firestore()
          .collection("reservations")
          .doc(reservationId)
          .update({
            "emails.confirmationEmailSent": true,
          });
        console.log(
          `Updated reservationId: ${reservationId} with confirmationEmailSent: true`
        );
      } catch (error) {
        console.error("Failed to send confirmation email:", error);
      }
    } else {
      console.log(
        `Confirmation email already sent for reservationId: ${reservationId}`
      );
    }

    // Envoyer l'email d'instructions pour les clés si applicable et pas déjà envoyé
    if (
      reservationData.beforeOrAfter === "before" &&
      !reservationData.emails.instructionsKeysEmailSent
    ) {
      const sendKeysEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendKeysEmail.sender = { email: "hahaddaoui@gmail.com", name: "Sahel" };
      sendKeysEmail.to = [{ email: reservationData.email }];
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
                <div><img src="https://firebasestorage.googleapis.com/v0/b/sahel-26e16.appspot.com/o/Logo%20Sahel%2FLogo-2-copie.png?alt=media&token=da1022cf-4416-4e78-8318-f053c25ee650" width="200" alt="Logo Sahel"></div>
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
        console.log(
          `Sending keys instructions email to: ${reservationData.email}`
        );
        await apiInstance.sendTransacEmail(sendKeysEmail);
        console.log("Keys instructions email sent successfully");

        // Mettre à jour le document pour marquer l'email d'instructions pour les clés comme envoyé
        await admin
          .firestore()
          .collection("reservations")
          .doc(reservationId)
          .update({
            "emails.instructionsKeysEmailSent": true,
          });
        console.log(
          `Updated reservationId: ${reservationId} with instructionsKeysEmailSent: true`
        );
      } catch (error) {
        console.error("Failed to send keys instructions email:", error);
      }
    } else {
      console.log(
        `Keys instructions email already sent for reservationId: ${reservationId}`
      );
    }

    // Envoyer l'email d'instructions par défaut si applicable et pas déjà envoyé
    if (
      reservationData.beforeOrAfter !== "before" &&
      !reservationData.emails.defaultInstructionsEmailSent
    ) {
      const sendDefaultInstructionsEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendDefaultInstructionsEmail.sender = {
        email: "hahaddaoui@gmail.com",
        name: "Sahel",
      };
      sendDefaultInstructionsEmail.to = [{ email: reservationData.email }];
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
                <div><img src="https://firebasestorage.googleapis.com/v0/b/sahel-26e16.appspot.com/o/Logo%20Sahel%2FLogo-2-copie.png?alt=media&token=da1022cf-4416-4e78-8318-f053c25ee650" width="200" alt="Logo Sahel"></div>
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
        console.log(
          `Sending default instructions email to: ${reservationData.email}`
        );
        await apiInstance.sendTransacEmail(sendDefaultInstructionsEmail);
        console.log("Default instructions email sent successfully");

        // Mettre à jour le document pour marquer l'email d'instructions par défaut comme envoyé
        await admin
          .firestore()
          .collection("reservations")
          .doc(reservationId)
          .update({
            "emails.defaultInstructionsEmailSent": true,
          });
        console.log(
          `Updated reservationId: ${reservationId} with defaultInstructionsEmailSent: true`
        );
      } catch (error) {
        console.error("Failed to send default instructions email:", error);
      }
    } else {
      console.log(
        `Keys instructions email already sent or not applicable for reservationId: ${reservationId}`
      );
    }
  });

// passe le statut de la réservation "à venir" à "en cours " le jour de la préstation

exports.updateReservationStatus = onSchedule("every 6 hours", async (event) => {
  const currentDate = new Date();
  logger.info(
    "updateReservationStatus function triggered at: ",
    currentDate.toISOString()
  );

  const today = new Date();
  const dateString = `${today.getDate().toString().padStart(2, "0")}-${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${today.getFullYear()}`;

  logger.info("Filtering reservations with date:", dateString);

  try {
    const snapshot = await admin
      .firestore()
      .collection("reservations")
      .where("serviceDate", "==", dateString)
      .where("serviceStatus", "==", "à venir")
      .get();

    logger.info(`Found ${snapshot.size} reservations to update`);

    const updates = [];
    snapshot.forEach((doc) => {
      logger.info(`Updating reservation ${doc.id}`);
      updates.push(doc.ref.update({ serviceStatus: "en cours" }));
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
    console.log(newValue.email);

    // Vérifiez si keyReceived est passé de false à true
    if (!previousValue.keyReceived && newValue.keyReceived) {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      sendSmtpEmail.sender = { email: "hahaddaoui@gmail.com", name: "Sahel" };
      sendSmtpEmail.to = [{ email: newValue.email }]; // Assurez-vous que l'email du client est bien stocké dans reservationData
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

      apiInstance.sendTransacEmail(sendSmtpEmail).then(
        (data) => {
          console.log("Email sent successfully");
        },
        (error) => {
          console.error("Failed to send email:", error);
        }
      );

      // Mise à jour du serviceStatus à "clés reçues"
      const reservationRef = change.after.ref;
      reservationRef
        .update({
          serviceStatus: "clés reçues",
        })
        .then(() => {
          console.log("serviceStatus mis à jour à 'clés reçues'");
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la mise à jour de serviceStatus:",
            error
          );
        });
    }
  });

// Fonction pour gérer les mises à jour du paiement (payé ou refusé)
exports.handlePaymentStatusAndServiceFee = functions.firestore
  .document("reservations/{reservationId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const reservationId = context.params.reservationId;

    try {
      // Vérifier si le statut de réservation a changé à "confirmé"
      if (
        before.bookingStatus !== "confirmé" &&
        after.bookingStatus === "confirmé"
      ) {
        console.log(`La réservation ${reservationId} a été confirmée.`);

        // Mettre à jour le statut de paiement à "en attente de paiement des frais de service"
        await admin.firestore().doc(`reservations/${reservationId}`).update({
          paymentStatus: "en attente de paiement des frais de service",
        });
        console.log(
          `Statut de paiement mis à jour pour la réservation ${reservationId} : en attente de paiement des frais de service.`
        );
      }

      // Vérifier si le statut de paiement a changé dans la sous-collection "devis"
      if (before.paymentStatus !== after.paymentStatus) {
        const devisId = context.params.devisId;

        if (after.paymentStatus === "payé") {
          console.log(
            `Le devis ${devisId} pour la réservation ${reservationId} a été payé.`
          );

          // Mettre à jour le devis comme payé
          await admin
            .firestore()
            .doc(`reservations/${reservationId}/devis/${devisId}`)
            .update({
              paymentStatus: "payé",
              paidAt: new Date().toISOString(), // Ajouter une date de paiement si nécessaire
            });
        } else if (after.paymentStatus === "refusé") {
          console.log(
            `Le devis ${devisId} pour la réservation ${reservationId} a été refusé.`
          );

          // Mettre à jour le devis pour refléter le refus
          await admin
            .firestore()
            .doc(`reservations/${reservationId}/devis/${devisId}`)
            .update({
              status: "refusé",
            });
        }
      }
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour du statut pour la réservation ${reservationId}:`,
        error
      );
    }
  });
