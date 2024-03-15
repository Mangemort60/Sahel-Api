const { admin } = require('../../config/firebaseConfig');
const { db } = require('../../config/firebaseConfig');
const Joi = require('joi');
const userSchema = require('../../models/userModel')

const registerUser = async (req, res) => {
    const { email, password, name, firstName } = req.body;
    const { error } = userSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        // Générer un nombre aléatoire à 4 chiffres
        const randomPart = Math.floor(1000 + Math.random() * 9000); // De 1000 à 9999

        // Récupérer et incrémenter le séquentiel
        const counterDoc = await db.collection('utils').doc('userCounter').get();
        let counter = counterDoc.exists ? counterDoc.data().counter : 0;
        counter += 1; // Incrémente le compteur
        await db.collection('utils').doc('userCounter').set({ counter }); // Mise à jour du compteur dans Firestore

        // Combiner les parties pour former le shortId
        const shortId = `${randomPart}${counter.toString().padStart(5, '0')}`; // Formate le compteur sur 5 chiffres

        // Création de l'utilisateur
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        // Enregistrement de l'utilisateur avec le shortId dans Firestore
        await db.collection('users').doc(userRecord.uid).set({
            name,
            firstName,
            roles: ["client"],
            shortId, // Stocke le shortId généré
        });

        res.status(201).json({ message: 'User created successfully.', shortId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


// Fonction pour authentifier l'utilisateur
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: 'Email and password are required.' });
    }

    try {
        // Connectez-vous avec Firebase Auth côté client et obtenez le token ID dans la réponse
        // Cet exemple suppose que le token ID est envoyé au serveur après connexion côté client
        const idToken = req.body.idToken; // Le token ID obtenu après la connexion côté client

        // Vérifiez le token ID avec Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Récupérez les informations supplémentaires de l'utilisateur si nécessaire
        const userRecord = await admin.auth().getUser(uid);

        // Répondez avec les informations de l'utilisateur ou un token personnalisé si nécessaire
        res.status(200).send({ message: 'User logged in successfully', uid, email: userRecord.email });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).send({ message: 'Login failed', error: error.message });
    }
};


module.exports = {
    registerUser, loginUser
};