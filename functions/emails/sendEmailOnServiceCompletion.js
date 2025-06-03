const functions = require("firebase-functions");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_KEY || functions.config().sendinblue.key;

const sendEmailOnServiceCompletion = functions.firestore
  .document("reservations/{reservationId}")
  .onUpdate((change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    // Check if the serviceStatus changed to "terminé"
    if (
      previousValue.bookingStatus !== "terminé" &&
      newValue.bookingStatus === "terminé"
    ) {
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      sendSmtpEmail.sender = {
        email: "contact@sahel-services.com",
        name: "Sahel",
      };
      sendSmtpEmail.to = [{ email: newValue.email }];
      sendSmtpEmail.subject = "Prestation terminée";
      sendSmtpEmail.htmlContent = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title> Prestation Terminée </title>
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
    <!-- Logo Section -->
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:20px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:560px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                          <tbody>
                            <tr>
                              <td style="width:150px;">
                                <img alt="Sahel logo" height="auto" src="https://firebasestorage.googleapis.com/v0/b/sahel-26e16.appspot.com/o/Logo%20Sahel%2FLogo-2-copie.png?alt=media&token=da1022cf-4416-4e78-8318-f053c25ee650" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="150" />
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
    <!-- Content Box -->
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#f5f4f5" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#f5f4f5;background-color:#f5f4f5;margin:0px auto;border-radius:8px;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f4f5;background-color:#f5f4f5;width:100%;border-radius:8px;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:0 20px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:560px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="center" style="font-size:0px;padding:20px 0;word-break:break-word;">
                        <div style="font-family:Ubuntu, Arial, sans-serif;font-size:28px;font-weight:bold;line-height:1;text-align:center;color:#333333;">Prestation Terminée</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 20px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Arial, sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#666666;">Bonjour ${newValue.firstName},</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 20px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Arial, sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#666666;">Nous avons le plaisir de vous informer que votre prestation de <strong>${newValue.reservationType}</strong> est maintenant terminée.</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 20px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Arial, sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#666666;">Nous vous remercions de votre confiance et espérons que vous êtes satisfait(e) de nos services. N'hésitez pas à nous contacter pour toute demande future.</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 20px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Arial, sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#666666;">Cordialement,<br /> L'équipe Sahel</div>
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
    <!-- Social Media Section -->
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:20px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td align="center" class="" style="vertical-align:top;width:560px;" ><![endif]-->
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
                                    <a href="https://www.facebook.com/sharer/sharer.php?u=https://www.facebook.com/" target="_blank">
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
                                    <a href="https://www.linkedin.com/shareArticle?mini=true&url=https://www.linkedin.com/&title=&summary=&source=" target="_blank">
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

      // Send the email
      return apiInstance.sendTransacEmail(sendSmtpEmail).then(
        () => {
          console.log("Email sent successfully");
        },
        (error) => {
          console.error("Failed to send email:", error);
        }
      );
    } else {
      return null;
    }
  });

module.exports = { sendEmailOnServiceCompletion };
