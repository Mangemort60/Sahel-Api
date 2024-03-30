const admin = require("firebase-admin")
const serviceAccount = require("../../sahel-26e16-firebase-adminsdk-jx0y3-42c287a958.json");


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });



const db = admin.firestore();

module.exports = { admin, db }