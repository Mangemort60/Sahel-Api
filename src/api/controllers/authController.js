const { admin } = require('../../config/firebaseConfig');
const { db } = require('../../config/firebaseConfig')

const registerUser = async (req, res) => {
    const { email, password, name, firstName } = req.body;
    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });
        await db.collection('users').doc(userRecord.uid).set({
            name: name,
            firstName: firstName,
            roles: ["client"],
        });
        res.status(201).send('User created successfully.');
    } catch (error) {
        res.status(500).send(error.message);
        console.log(error);
    }
};


const loginUser = (req, res) => {
    // La logique de connexion serait gérée côté client avec Firebase Authentication
};

const logoutUser = (req, res) => {
    // La déconnexion serait également gérée côté client avec Firebase Authentication
};


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
};