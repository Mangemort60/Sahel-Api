require("dotenv").config();
const functions = require("firebase-functions");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const { admin } = require("../firebaseFunctionsConfig");

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_KEY || functions.config().sendinblue.key;

// Fonction d'envoi des emails de confirmation et instructions pour les frais de service payés
const sendConfirmationAndInstructionsEmails = functions.firestore
  .document("reservations/{reservationId}")
  .onUpdate(async (change, context) => {
    const reservationData = change.after.data();
    const reservationId = context.params.reservationId;

    if (
      reservationData.serviceFeeInfo.paid &&
      reservationData.reservationType === "petits-travaux"
    ) {
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

      // Vérifier si les emails ont déjà été envoyés
      if (reservationData.emails.serviceFeeConfirmationEmailSent) {
        console.log(`Emails already sent for reservationId: ${reservationId}`);
        return;
      }

      const sendConfirmationEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendConfirmationEmail.sender = {
        email: "contact@sahel-services.com",
        name: "Sahel",
      };
      sendConfirmationEmail.to = [{ email: reservationData.email }];
      sendConfirmationEmail.subject = "Confirmation de votre réservation";
      sendConfirmationEmail.htmlContent = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title> Confirmation de Paiement </title>
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
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                          <tbody>
                            <tr>
                              <td style="width:150px;">
                                <a href="https://sahel-26e16.web.app/" target="_blank">
                                  <img alt="Sahel Logo" height="auto" src="https://firebasestorage.googleapis.com/v0/b/sahel-26e16.appspot.com/o/Logo%20Sahel%2FLogo-2-copie.png?alt=media&token=da1022cf-4416-4e78-8318-f053c25ee650" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="150" />
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="center" style="font-size:0px;padding:20px 0;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:24px;font-weight:bold;line-height:1;text-align:center;color:#1d1c1d;">Confirmation de Paiement des Frais de Service</div>
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
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="left" style="font-size:0px;padding:0 20px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1;text-align:left;color:#666666;">Bonjour ${reservationData.firstName},</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 20px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1;text-align:left;color:#666666;">Nous confirmons la réception de votre paiement des frais de service pour votre demande de petits travaux. Le processus est désormais en cours.</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:0 20px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1;text-align:left;color:#666666;">Vous recevrez sous peu un email contenant les instructions pour la remise des clés. Une fois les clés reçues, nous vous tiendrons informé(e) de la visite des lieux et du début des travaux.</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:0 20px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1;text-align:left;color:#666666;">Merci de votre confiance,</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 20px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1;text-align:left;color:#666666;">L'équipe Sahel</div>
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

      const sendKeysEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendKeysEmail.sender = {
        email: "contact@sahel-services.com",
        name: "Sahel",
      };
      sendKeysEmail.to = [{ email: reservationData.email }];
      sendKeysEmail.subject = "Instructions pour la remise des clés";
      sendKeysEmail.htmlContent = `<!doctype html>
<html
xmlns="http://www.w3.org/1999/xhtml"
xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:o="urn:schemas-microsoft-com:office:office"
>
<head>
<title> </title>
<!--[if !mso]><!-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
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
      <o:AllowPNG />
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
</noscript>
<![endif]-->
<!--[if lte mso 11]>
<style type="text/css">
  .mj-outlook-group-fix {
    width: 100% !important;
  }
</style>
<![endif]-->
<!--[if !mso]><!-->
<link
href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700"
rel="stylesheet"
type="text/css"
/>
<style type="text/css">
@import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
</style>
<!--<![endif]-->
<style type="text/css">
@media only screen and (min-width: 480px) {
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
@media only screen and (max-width: 480px) {
  table.mj-full-width-mobile {
    width: 100% !important;
  }

  td.mj-full-width-mobile {
    width: auto !important;
  }
}
</style>
</head>

<body style="word-spacing: normal">
<div style="">
<!-- Section du logo -->
<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
<div style="margin: 0px auto; max-width: 600px">
  <table
    align="center"
    border="0"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="width: 100%"
  >
    <tbody>
      <tr>
        <td
          style="
            direction: ltr;
            font-size: 0px;
            padding: 20px;
            text-align: center;
          "
        >
          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:560px;" ><![endif]-->
          <div
            class="mj-column-per-100 mj-outlook-group-fix"
            style="
              font-size: 0px;
              text-align: left;
              direction: ltr;
              display: inline-block;
              vertical-align: top;
              width: 100%;
            "
          >
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="vertical-align: top"
              width="100%"
            >
              <tbody>
                <tr>
                  <td
                    align="center"
                    style="
                      font-size: 0px;
                      padding: 10px 25px;
                      word-break: break-word;
                    "
                  >
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0px;
                      "
                    >
                      <tbody>
                        <tr>
                          <td style="width: 200px">
                            <img
                              alt="sahel logo"
                              height="auto"
                              src="https://firebasestorage.googleapis.com/v0/b/sahel-26e16.appspot.com/o/Logo%20Sahel%2FLogo-2-copie.png?alt=media&token=da1022cf-4416-4e78-8318-f053c25ee650"
                              style="
                                border: 0;
                                display: block;
                                outline: none;
                                text-decoration: none;
                                height: auto;
                                width: 100%;
                                font-size: 13px;
                              "
                              width="200"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
<!-- Contenu principal de l'email -->
<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
<div style="margin: 0px auto; max-width: 600px">
  <table
    align="center"
    border="0"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="width: 100%"
  >
    <tbody>
      <tr>
        <td
          style="
            direction: ltr;
            font-size: 0px;
            padding: 20px 0;
            text-align: center;
          "
        >
          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
          <div
            class="mj-column-per-100 mj-outlook-group-fix"
            style="
              font-size: 0px;
              text-align: left;
              direction: ltr;
              display: inline-block;
              vertical-align: top;
              width: 100%;
            "
          >
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="vertical-align: top"
              width="100%"
            >
              <tbody>
                <tr>
                  <td
                    align="left"
                    style="
                      font-size: 0px;
                      padding: 10px 25px;
                      word-break: break-word;
                    "
                  >
                    <div
                      style="
                        font-family: Ubuntu, Helvetica, Arial, sans-serif;
                        font-size: 24px;
                        font-weight: bold;
                        line-height: 1;
                        text-align: center;
                        color: #333333;
                      "
                    >
                      Instructions d’envoi de vos Clés
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    align="center"
                    style="
                      font-size: 0px;
                      padding: 10px 25px;
                      word-break: break-word;
                    "
                  >
                  </td>
                </tr>
                <tr>
                  <td
                    align="left"
                    style="
                      font-size: 0px;
                      padding: 10px 25px;
                      word-break: break-word;
                    "
                  >
                    <div
                      style="
                        font-family: Ubuntu, Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        line-height: 1;
                        text-align: left;
                        color: #555555;
                      "
                    >
                      Bonjour ${reservationData.firstName},
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    align="left"
                    style="
                      font-size: 0px;
                      padding: 10px 25px;
                      word-break: break-word;
                    "
                  >
                    <div
                      style="
                        font-family: Ubuntu, Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        line-height: 1;
                        text-align: left;
                        color: #555555;
                      "
                    >
                      Merci de faire appel à nos services de conciergerie.
                      Nous avons mis en place un processus sécurisé pour
                      la réception de vos clés en France, afin de
                      simplifier et sécuriser l'envoi vers le Maroc. Voici
                      les étapes à suivre :
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    align="left"
                    style="
                      font-size: 0px;
                      padding: 10px 25px;
                      word-break: break-word;
                    "
                  >
                    <div
                      style="
                        font-family: Ubuntu, Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        line-height: 1;
                        text-align: left;
                        color: #555555;
                      "
                    >
                      <strong
                        >1. Préparation et Envoi de vos Clés :</strong
                      ><br />
                      Veuillez envoyer vos clés à notre adresse de
                      regroupement en France :<br />
                      <strong>[Adresse de regroupement en France]</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    align="left"
                    style="
                      font-size: 0px;
                      padding: 10px 25px;
                      word-break: break-word;
                    "
                  >
                    <div
                      style="
                        font-family: Ubuntu, Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        line-height: 1;
                        text-align: left;
                        color: #555555;
                      "
                    >
                      Utilisez l’un des services d’expédition sécurisés
                      suivants pour garantir le suivi et la sécurité de
                      votre envoi :
                      <ul>
                        <li>
                          <strong>Chronopost</strong> : Livraison rapide
                          avec suivi en ligne et option d'assurance.
                        </li>
                        <li>
                          <strong>Colissimo Recommandé</strong> : Service
                          de La Poste avec remise contre signature et
                          possibilité d'assurance.
                        </li>
                        <li>
                          <strong>UPS ou DHL</strong> : Services rapides
                          avec suivi en temps réel et différentes options
                          de couverture.
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    align="left"
                    style="
                      font-size: 0px;
                      padding: 10px 25px;
                      word-break: break-word;
                    "
                  >
                    <div
                      style="
                        font-family: Ubuntu, Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        line-height: 1;
                        text-align: left;
                        color: #555555;
                      "
                    >
                      <strong>2. Confirmation de Réception :</strong
                      ><br />
                      Dès réception de vos clés à notre adresse en France,
                      nous vous enverrons un e-mail de confirmation.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    align="left"
                    style="
                      font-size: 0px;
                      padding: 10px 25px;
                      word-break: break-word;
                    "
                  >
                    <div
                      style="
                        font-family: Ubuntu, Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        line-height: 1;
                        text-align: left;
                        color: #555555;
                      "
                    >
                      <strong>3. Envoi vers le Maroc :</strong><br />
                      Une fois regroupées, vos clés seront envoyées au
                      Maroc en une seule expédition sécurisée. Nous vous
                      tiendrons informé(e) de la date exacte d'envoi et du
                      suivi de cet envoi.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    align="left"
                    style="
                      font-size: 0px;
                      padding: 10px 25px;
                      word-break: break-word;
                    "
                  >
                    <div
                      style="
                        font-family: Ubuntu, Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        line-height: 1;
                        text-align: left;
                        color: #555555;
                      "
                    >
                      Nous restons à votre disposition pour toute question
                      ou information supplémentaire concernant ce
                      processus.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    align="left"
                    style="
                      font-size: 0px;
                      padding: 10px 25px;
                      word-break: break-word;
                    "
                  >
                    <div
                      style="
                        font-family: Ubuntu, Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        line-height: 1;
                        text-align: left;
                        color: #555555;
                      "
                    >
                      Cordialement,<br />
                      [Votre Prénom et Nom]<br />
                      [Nom de l’entreprise]<br />
                      [Coordonnées de l’entreprise]
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
<!-- Section des réseaux sociaux -->
<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
<div style="margin: 0px auto; max-width: 600px">
  <table
    align="center"
    border="0"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="width: 100%"
  >
    <tbody>
      <tr>
        <td
          style="
            direction: ltr;
            font-size: 0px;
            padding: 20px;
            text-align: center;
          "
        >
          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:560px;" ><![endif]-->
          <div
            class="mj-column-per-100 mj-outlook-group-fix"
            style="
              font-size: 0px;
              text-align: left;
              direction: ltr;
              display: inline-block;
              vertical-align: top;
              width: 100%;
            "
          >
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="vertical-align: top"
              width="100%"
            >
              <tbody>
                <tr>
                  <td
                    align="center"
                    style="
                      font-size: 0px;
                      padding: 10px 25px;
                      word-break: break-word;
                    "
                  >
                    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" ><tr><td><![endif]-->
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="float: none; display: inline-table"
                    >
                      <tr>
                        <td style="padding: 4px; vertical-align: middle">
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            role="presentation"
                            style="
                              background: #3b5998;
                              border-radius: 3px;
                              width: 30px;
                            "
                          >
                            <tr>
                              <td
                                style="
                                  font-size: 0;
                                  height: 30px;
                                  vertical-align: middle;
                                  width: 30px;
                                "
                              >
                                <a
                                  href="https://www.facebook.com/sharer/sharer.php?u=LIEN_FACEBOOK"
                                  target="_blank"
                                >
                                  <img
                                    height="30"
                                    src="https://www.mailjet.com/images/theme/v1/icons/ico-social/facebook.png"
                                    style="
                                      border-radius: 3px;
                                      display: block;
                                    "
                                    width="30"
                                  />
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <!--[if mso | IE]></td><td><![endif]-->
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="float: none; display: inline-table"
                    >
                      <tr>
                        <td style="padding: 4px; vertical-align: middle">
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            role="presentation"
                            style="
                              background: #0077b5;
                              border-radius: 3px;
                              width: 30px;
                            "
                          >
                            <tr>
                              <td
                                style="
                                  font-size: 0;
                                  height: 30px;
                                  vertical-align: middle;
                                  width: 30px;
                                "
                              >
                                <a
                                  href="https://www.linkedin.com/shareArticle?mini=true&url=LIEN_LINKEDIN&title=&summary=&source="
                                  target="_blank"
                                >
                                  <img
                                    height="30"
                                    src="https://www.mailjet.com/images/theme/v1/icons/ico-social/linkedin.png"
                                    style="
                                      border-radius: 3px;
                                      display: block;
                                    "
                                    width="30"
                                  />
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
</html>
`;

      try {
        // Envoi des emails
        await apiInstance.sendTransacEmail(sendConfirmationEmail);
        await apiInstance.sendTransacEmail(sendKeysEmail);
        console.log("Confirmation and instructions emails sent successfully.");

        // Marquer les emails comme envoyés dans Firestore
        await admin
          .firestore()
          .collection("reservations")
          .doc(reservationId)
          .update({
            "emails.serviceFeeConfirmationEmailSent": true,
          });
        console.log(
          `Emails marked as sent for reservationId: ${reservationId}`
        );
      } catch (error) {
        console.error("Failed to send emails:", error);
      }
    } else {
      console.log(
        `Conditions not met for reservationId: ${reservationId}, skipping emails.`
      );
    }
  });

module.exports = { sendConfirmationAndInstructionsEmails };
