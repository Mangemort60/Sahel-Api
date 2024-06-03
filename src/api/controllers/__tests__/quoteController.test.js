const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { calculateQuote } = require('../../controllers/quoteController');
const { getRateDetails } = require('../../../services/quoteService');

jest.mock('../../../services/quoteService', () => ({
    getRateDetails: jest.fn(),
}));

const app = express();
app.use(bodyParser.json());
app.post('/quote', calculateQuote);

describe('quoteController - calculateQuote', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if size range is not found', async () => {
        getRateDetails.mockResolvedValue(null);

        const response = await request(app)
            .post('/quote')
            .send({ sizeRange: 'small', numberOfFloors: 2, fruitBasketSelected: false });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Size range not found');
    });

    it('should return the total price correctly without fruit basket', async () => {
        getRateDetails.mockResolvedValue({
            variableCost: 10,
            logisticCost: 15,
            productionCost: 25,
            margin: 0.2, // 20% margin
            taxRate: 0.2, // 20% tax
            fruitBasketPrice: 15
        });

        const response = await request(app)
            .post('/quote')
            .send({ sizeRange: 'medium', numberOfFloors: 3, fruitBasketSelected: false });

        const marginEuro = 25 * 0.2; // 5
        const totalPriceHT = Math.ceil((3 * 10) + 15 + marginEuro); // 50
        const taxesAndVAT = totalPriceHT * 0.2; // 10
        const expectedPrice = Math.round((totalPriceHT + taxesAndVAT) * 100) / 100; // 60.00

        console.log('Expected Price without Fruit Basket:', expectedPrice);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalPrice', expectedPrice);
    });

    it('should return the total price correctly with fruit basket', async () => {
        getRateDetails.mockResolvedValue({
            variableCost: 10,
            logisticCost: 15,
            productionCost: 25,
            margin: 0.2, // 20% margin
            taxRate: 0.2, // 20% tax
            fruitBasketPrice: 15
        });

        const response = await request(app)
            .post('/quote')
            .send({ sizeRange: 'medium', numberOfFloors: 3, fruitBasketSelected: true });

        const marginEuro = 25 * 0.2; // 5
        const totalPriceHT = Math.ceil((3 * 10) + 15 + marginEuro); // 50
        const taxesAndVAT = totalPriceHT * 0.2; // 10
        let expectedPrice = totalPriceHT + taxesAndVAT; // 60
        expectedPrice += 15; // Adding fruit basket price
        expectedPrice = Math.round(expectedPrice * 100) / 100; // 75.00

        console.log('Expected Price with Fruit Basket:', expectedPrice);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalPrice', expectedPrice);
    });

    it('should return 500 if there is an error', async () => {
        getRateDetails.mockRejectedValue(new Error('Internal Server Error'));

        const response = await request(app)
            .post('/quote')
            .send({ sizeRange: 'large', numberOfFloors: 5, fruitBasketSelected: true });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Internal Server Error');
    });
});
