const { admin } = require('../../config/firebaseConfig');
const { db } = require('../../config/firebaseConfig');
const Joi = require('joi');
const userSchema = require('../../models/userModel')

const registerUser = async (req, res) => {
    const { email, password, name, firstName } = req.body;
    const { error, value } = userSchema.validate(req.body)
    
    if(error) {
        return res.status(400).json({ error: error.details[0].message });
    } 

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



module.exports = {
    registerUser
};