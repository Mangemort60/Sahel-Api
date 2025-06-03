const { log } = require("firebase-functions/logger");
const { admin, db, auth } = require("../../config/firebaseConfig");
const userSchema = require("../../models/userModel");
const { getAuth, sendPasswordResetEmail } = require("firebase/auth");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const registerUser = async (req, res) => {
  const { email, password, name, firstName, phone } = req.body;
  const { error } = userSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Générer un nombre aléatoire à 4 chiffres
    const randomPart = Math.floor(1000 + Math.random() * 9000); // De 1000 à 9999

    // Récupérer et incrémenter le séquentiel
    const counterDoc = await db.collection("utils").doc("userCounter").get();
    let counter = counterDoc.exists ? counterDoc.data().counter : 0;
    counter += 1; // Incrémente le compteur
    await db.collection("utils").doc("userCounter").set({ counter }); // Mise à jour du compteur dans Firestore

    // Combiner les parties pour former le shortId
    const shortId = `${randomPart}${counter.toString().padStart(5, "0")}`; // Formate le compteur sur 5 chiffres

    const role = "client";

    // Création de l'utilisateur
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Enregistrement de l'utilisateur avec le shortId dans Firestore
    await db.collection("users").doc(userRecord.uid).set({
      name,
      firstName,
      email,
      phone,
      role,
      shortId, // Stocke le shortId généré
    });

    // Générer un token d'authentification personnalisé pour l'utilisateur
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      message: "User created successfully.",
      shortId,
      token: customToken,
      role,
    });
  } catch (error) {
    console.error(error);

    // Gérer le cas spécifique où l'email existe déjà
    if (error.code === "auth/email-already-exists") {
      return res
        .status(409)
        .json({ error: "Cette adresse email est déjà utilisée." });
    }

    // Gérer d'autres erreurs
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

const getUserDataAndVerifyToken = async (req, res, next) => {
  // Extrait le token d'authentification Firebase du header d'autorisation
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "Aucun token fourni." });
  }

  try {
    // Vérifie le token d'authentification avec Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Récupère les données utilisateur de Firestore
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res
        .status(404)
        .json({ error: "Données utilisateur introuvables." });
    }

    req.user = { userId, ...userDoc.data() };
    console.log("REQ USER", req.user);
    next(); // Passez au middleware/routeur suivant
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Échec de l’authentification." });
  }
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Génération du lien de réinitialisation de mot de passe
    const link = await admin.auth().generatePasswordResetLink(email);

    console.log("email", email);

    // Configuration de l'email à envoyer
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      email: "contact@sahel-services.com",
      name: "Sahel",
    };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = "Réinitialisation de votre mot de passe";
    sendSmtpEmail.htmlContent = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title>
  </title>
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
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;"> Réinitialisation de votre mot de passe </div>
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
                              <td style="width:200px;">
                                <img alt="Sahel Logo" height="auto" src="https://firebasestorage.googleapis.com/v0/b/sahel-26e16.appspot.com/o/Logo%20Sahel%2FLogo-2-copie.png?alt=media&token=da1022cf-4416-4e78-8318-f053c25ee650" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="200">
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
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:24px;font-weight:bold;line-height:1;text-align:center;color:#1d1c1d;">Réinitialisation de votre mot de passe</div>
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
            <td style="direction:ltr;font-size:0px;padding:20px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:560px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#666666;">Bonjour,</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#666666;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" vertical-align="middle" style="font-size:0px;padding:15px;word-break:break-word;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;">
                          <tr>
                            <td align="center" bgcolor="#007BFF" role="presentation" style="border:none;border-radius:4px;cursor:auto;mso-padding-alt:10px 25px;background:#007BFF;" valign="middle">
                              <a href="${link}" style="display:inline-block;background:#007BFF;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:4px;" target="_blank"> Réinitialiser mon mot de passe </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#666666;">Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email. Pour toute question ou assistance, n'hésitez pas à nous contacter.</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#666666;">Cordialement, <br> L'équipe Sahel</div>
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
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" ><tr><td><![endif]-->
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;">
                          <tr>
                            <td style="padding:4px;vertical-align:middle;">
                              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#3b5998;border-radius:3px;width:30px;">
                                <tr>
                                  <td style="font-size:0;height:30px;vertical-align:middle;width:30px;">
                                    <a href="https://www.facebook.com/sharer/sharer.php?u=https://www.facebook.com/sharer/sharer.php?u=https://sahel.com" target="_blank">
                                      <img height="30" src="https://www.mailjet.com/images/theme/v1/icons/ico-social/facebook.png" style="border-radius:3px;display:block;" width="30">
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
                                    <a href="https://www.linkedin.com/shareArticle?mini=true&url=https://www.linkedin.com/shareArticle?mini=true&url=https://sahel.com&title=&summary=&source=" target="_blank">
                                      <img height="30" src="https://www.mailjet.com/images/theme/v1/icons/ico-social/linkedin.png" style="border-radius:3px;display:block;" width="30">
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
    // Envoyer l'email via Sendinblue
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.sendTransacEmail(sendSmtpEmail).then(
      (data) => {
        console.log("Email sent successfully");
        res
          .status(200)
          .json({ message: "Password reset email sent successfully." });
      },
      (error) => {
        console.error("Failed to send email:", error);
        res.status(500).json({ error: "Failed to send email." });
      }
    );
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ error: "Error sending password reset email." });
  }
};

const registerAdmin = async (req, res) => {
  const { email, password, name, firstName } = req.body;

  try {
    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Ajouter les custom claims (rôle admin)
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "admin" });

    // Enregistrer les informations supplémentaires dans Firestore
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      role: "admin",
      name,
      firstName,
      createdAt: new Date(),
    });

    res
      .status(201)
      .json({ message: "Admin créé avec succès", uid: userRecord.uid });
  } catch (error) {
    console.error("Erreur lors de la création de l'admin :", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerAdmin,
};

module.exports = {
  registerUser,
  getUserDataAndVerifyToken,
  resetPassword,
  registerAdmin,
};
