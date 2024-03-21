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

const getUserDataAndVerifyToken = async (req, res) => {
    // Extrait le token d'authentification Firebase du header d'autorisation
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Aucun token fourni.' });
    }

    try {
        // Vérifie le token d'authentification avec Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;

        // Récupère les données utilisateur de Firestore
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Données utilisateur introuvables.' });
        }

        const userData = userDoc.data();

        // Renvoie les données de l'utilisateur au client
        res.status(200).json({ userId, ...userData });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Échec de l’authentification.' });
    }
};

module.exports = {
    registerUser, getUserDataAndVerifyToken
};