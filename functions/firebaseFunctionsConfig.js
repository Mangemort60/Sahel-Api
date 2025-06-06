/* eslint-disable linebreak-style */
/* eslint-disable max-len */
require("dotenv").config();
const admin = require("firebase-admin");

console.log("MY_FIREBASE_PROJECT_ID:", process.env.MY_FIREBASE_PROJECT_ID);
console.log(
  "MY_FIREBASE_PRIVATE_KEY_ID:",
  process.env.MY_FIREBASE_PRIVATE_KEY_ID ? "Loaded" : "Missing"
);
console.log("MY_FIREBASE_CLIENT_EMAIL:", process.env.MY_FIREBASE_CLIENT_EMAIL);

const serviceAccount = {
  type: "service_account",
  project_id: process.env.MY_FIREBASE_PROJECT_ID,
  private_key_id: process.env.MY_FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.MY_FIREBASE_PRIVATE_KEY
    ? process.env.MY_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined,
  client_email: process.env.MY_FIREBASE_CLIENT_EMAIL,
  client_id: process.env.MY_FIREBASE_CLIENT_ID,
  auth_uri: process.env.MY_FIREBASE_AUTH_URI,
  token_uri: process.env.MY_FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.MY_FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.MY_FIREBASE_CLIENT_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
