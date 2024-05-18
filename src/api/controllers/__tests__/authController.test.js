const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { admin, db } = require('../../../config/firebaseConfig');
const authController = require('../../controllers/authController');

jest.mock('../../../config/firebaseConfig', () => ({
    admin: {
        auth: jest.fn().mockReturnThis(),
        createUser: jest.fn(),
        verifyIdToken: jest.fn(),
    },
    db: {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        get: jest.fn(),
        set: jest.fn(),
    }
}));

const app = express();
app.use(bodyParser.json());
app.post('/register', authController.registerUser);
app.get('/userdata', authController.getUserDataAndVerifyToken, (req, res) => {
    res.status(200).json(req.user);
});

describe('authController - registerUser', () => {
    it('should return 400 if validation fails', async () => {
        const response = await request(app)
            .post('/register')
            .send({ email: '', password: 'password123', name: 'Test', firstName: 'User' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('should return 201 and user shortId on successful registration', async () => {
        const fakeUserRecord = { uid: 'testUID' };
        admin.auth().createUser.mockResolvedValue(fakeUserRecord);
        db.collection().doc().get.mockResolvedValue({ exists: true, data: () => ({ counter: 1 }) });
        db.collection().doc().set.mockResolvedValue();

        const response = await request(app)
            .post('/register')
            .send({ email: 'test@example.com', password: 'Password1!', name: 'Test', firstName: 'User' });

        console.log('Response:', response.body);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User created successfully.');
        expect(response.body).toHaveProperty('shortId');
    });

    it('should return 500 if there is an error during registration', async () => {
        const errorMessage = 'Error creating user';
        admin.auth().createUser.mockRejectedValue(new Error(errorMessage));

        const response = await request(app)
            .post('/register')
            .send({ email: 'test@example.com', password: 'Password1!', name: 'Test', firstName: 'User' });

        console.log('Error Response:', response.body);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', errorMessage);
    });
});

describe('authController - getUserDataAndVerifyToken', () => {
    it('should return 401 if no token is provided', async () => {
        const response = await request(app)
            .get('/userdata')
            .set('Authorization', '');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Aucun token fourni.');
    });

    it('should return 401 if token verification fails', async () => {
        admin.auth().verifyIdToken.mockRejectedValue(new Error('Token verification failed'));

        const response = await request(app)
            .get('/userdata')
            .set('Authorization', 'Bearer invalidToken');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Échec de l’authentification.');
    });

    it('should return 404 if user data is not found', async () => {
        admin.auth().verifyIdToken.mockResolvedValue({ uid: 'testUID' });
        db.collection().doc().get.mockResolvedValue({ exists: false });

        const response = await request(app)
            .get('/userdata')
            .set('Authorization', 'Bearer validToken');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Données utilisateur introuvables.');
    });

    it('should return user data if token is valid and user data is found', async () => {
        const userData = { userId: 'testUID', name: 'Test', firstName: 'User' };
        admin.auth().verifyIdToken.mockResolvedValue({ uid: 'testUID' });
        db.collection().doc().get.mockResolvedValue({ exists: true, data: () => userData });

        const response = await request(app)
            .get('/userdata')
            .set('Authorization', 'Bearer validToken');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(userData);
    });
});