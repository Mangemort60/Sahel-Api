const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { calculateQuote } = require('../quoteController');
const { getRateDetails } = require('../../../services/quoteService');

jest.mock('../../../services/quoteService', () => ({
    getRateDetails: jest.fn(),
}));

const app = express();
app.use(bodyParser.json());
app.post('/calculate-quote', calculateQuote);

describe('quoteController - calculateQuote', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if size range is not found', async () => {
        getRateDetails.mockResolvedValue(null);

        const response = await request(app)
            .post('/calculate-quote')
            .send({ sizeRange: 'small', numberOfFloors: 2, fruitBasketSelected: false });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Size range not found');
    });

    it('should return the total price correctly without fruit basket', async () => {
        getRateDetails.mockResolvedValue({
            variableCost: 10,
            logisticCost: 50,
            marginEuro: 20,
            fruitBasketPrice: 15
        });

        const response = await request(app)
            .post('/calculate-quote')
            .send({ sizeRange: 'medium', numberOfFloors: 3, fruitBasketSelected: false });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalPrice', 134); // Calcul: (3 * 10) + 50 + 20 * 1.20 = 134
    });

    it('should return the total price correctly with fruit basket', async () => {
        getRateDetails.mockResolvedValue({
            variableCost: 10,
            logisticCost: 50,
            marginEuro: 20,
            fruitBasketPrice: 15
        });

        const response = await request(app)
            .post('/calculate-quote')
            .send({ sizeRange: 'medium', numberOfFloors: 3, fruitBasketSelected: true });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalPrice', 149); // Calcul: (3 * 10) + 50 + 20 * 1.20 + 15 = 149
    });

    it('should return 500 if there is an error', async () => {
        getRateDetails.mockRejectedValue(new Error('Internal Server Error'));

        const response = await request(app)
            .post('/calculate-quote')
            .send({ sizeRange: 'large', numberOfFloors: 5, fruitBasketSelected: true });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Internal Server Error');
    });
});
