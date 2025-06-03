/* eslint-disable linebreak-style */
/* eslint-disable max-len */
require("dotenv").config();

const functions = require("firebase-functions");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const { admin } = require("../firebaseFunctionsConfig");

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_KEY || functions.config().sendinblue.key;

const sendEmailConfirmationCooking = functions.firestore
  .document("reservations/{reservationId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const reservationId = context.params.reservationId;

    // Ne traiter que les réservations de type "ménage"
    if (after.reservationType !== "cuisine") return;

    // Détecter le passage de "en attente" à "confirmé"
    const statusChangedToConfirmed =
      before.bookingStatus === "en attente" &&
      after.bookingStatus === "confirmé";

    if (!statusChangedToConfirmed) return;

    const reservationData = after;
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    // Envoyer l'email de confirmation si pas déjà envoyé
    if (!reservationData.emails.confirmationEmailSent) {
      console.log("reservation email :", reservationData.email);
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.sender = {
        email: "contact@sahel-services.com",
        name: "Sahel",
      };
      sendSmtpEmail.to = [{ email: reservationData.email }];
      sendSmtpEmail.subject = "Confirmation de votre réservation";
      sendSmtpEmail.htmlContent = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title> Confirmation de Réservation pour le Service de Cuisine </title>
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
  <div style="background-color:#ffffff;">
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:10px 0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
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
                                  <img alt="Sahel Logo" height="auto" src="https://firebasestorage.googleapis.com/v0/b/sahel-26e16.appspot.com/o/Logo%20Sahel%2FLogo-2-copie.png?alt=media&token=da1022cf-4416-4e78-8318-f053c25ee650" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="200" />
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size:0px;padding:20px 0 10px 0;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:24px;font-weight:bold;line-height:1;text-align:center;color:#1d1c1d;">Confirmation de votre réservation</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1;text-align:left;color:#666666;">Bonjour ${after.firstName},<br /> Merci pour votre réservation avec Sahel !<br /> Votre prestation de <strong>cuisine</strong> prévue le <strong>${after.serviceStartDate}</strong> a été confirmée.</div>
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
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#f5f5f5" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#f5f5f5;background-color:#f5f5f5;margin:0px auto;border-radius:8px;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f5f5;background-color:#f5f5f5;width:100%;border-radius:8px;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:10px 0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:1;text-align:left;color:#000000;">Détails de votre prestation de cuisine</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1;text-align:left;color:#666666;"><strong>Lieu de la prestation :</strong> ${after.address}<br />
                          <strong>Date :</strong> ${after.serviceStartDate}<br />
                          <strong>Période :</strong> ${after.period}<br />
                          <strong>Nombre de personnes :</strong> ${after.numberOfPeople}<br />
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
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:10px 0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
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
                                    <a href="https://www.facebook.com/sharer/sharer.php?u=https://www.facebook.com/sharer/sharer.php?u=https://sahel-26e16.web.app/" target="_blank">
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
                                    <a href="https://www.linkedin.com/shareArticle?mini=true&url=https://www.linkedin.com/shareArticle?mini=true&url=https://sahel-26e16.web.app/&title=&summary=&source=" target="_blank">
                                      <img height="30" src="https://www.mailjet.com/images/theme/v1/icons/ico-social/linkedin.png" style="border-radius:3px;display:block;" width="30" />
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
  });

module.exports = { sendEmailConfirmationCooking };
