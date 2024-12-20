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
    res.status(500).json({ error: error.message });
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

    // Configuration de l'email à envoyer
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { email: "sahel@example.com", name: "Sahel" };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = "Réinitialisation de votre mot de passe";
    sendSmtpEmail.htmlContent = `
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Réinitialisation de votre mot de passe</title>
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
                  <h1>Réinitialisation de votre mot de passe</h1>
                </td>
              </tr>
              <tr>
                <td class="content">
                  <p>Bonjour,</p>
                  <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                  <p><a href="${link}">Réinitialiser mon mot de passe</a></p>
                  <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
                  <p>Merci,</p>
                  <p>L'équipe Sahel</p>
                </td>
              </tr>
            </table>
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
