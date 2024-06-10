
// firebase.js
const admin = require("firebase-admin")
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore'); // getFirestore est une instance de firestore, et fielValue une fonction qui permet d'agir sur les champs
const { getStorage } = require('firebase-admin/storage');
const serviceAccount = require('../../sahel-26e16-firebase-adminsdk-jx0y3-42c287a958.json');

admin.initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'sahel-26e16.appspot.com' // Remplacez par le nom de votre bucket de stockage Firebase
});

const db = getFirestore();
const bucket = getStorage().bucket();

module.exports = { db, bucket, FieldValue ,admin};
