const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");


// Configuration de votre projet Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB2T_IRsooIzycMWzkg97RTGQsNnGwY5Co",
    authDomain: "sahel-26e16.firebaseapp.com",
    projectId: "sahel-26e16",
    storageBucket: "sahel-26e16.appspot.com",
    messagingSenderId: "27003834326",
    appId: "1:27003834326:web:7b84c54c0d3c359894de77",
    measurementId: "G-FVM2SHPVP0"
  };
  
// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Authentifier et obtenir un token
signInWithEmailAndPassword(auth, "test1709314792434@example.com", "password")
  .then((userCredential) => {
    const user = userCredential.user;
    return user.getIdToken().then((idToken) => {
      console.log("Firebase ID Token:", idToken);
    });
  })
  .catch((error) => {
    console.error("Error obtaining ID token:", error);
  });