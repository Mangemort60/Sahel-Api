// firebase.js
require("dotenv").config();
const admin = require("firebase-admin");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore"); // getFirestore est une instance de firestore, et fielValue une fonction qui permet d'agir sur les champs
const { getStorage } = require("firebase-admin/storage");

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

// Log des variables d'environnement pour vérifier
console.log(serviceAccount);

admin.initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "sahel-26e16.appspot.com", // Remplacez par le nom de votre bucket de stockage Firebase
});

const db = getFirestore();
const bucket = getStorage().bucket();

module.exports = { db, bucket, FieldValue, admin };
