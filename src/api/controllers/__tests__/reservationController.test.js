const supertest = require('supertest');
const app = require('../../../app'); // Assurez-vous que le chemin d'accès à votre application Express est correct
const { db } = require('../../../config/firebaseConfig');
const dayjs = require('dayjs');

// Mock db.collection et ses méthodes utilisées dans le contrôleur
jest.mock('../../../config/firebaseConfig.js', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
    add: jest.fn()
  }
}));

describe('Reservation Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Nettoyer les mocks avant chaque test
  });

  it('should successfully create a reservation for a valid future date', async () => {
    // Générer dynamiquement une date future (par exemple, 30 jours à partir d'aujourd'hui)
    const futureDate = dayjs().add(30, 'day').format('YYYY-MM-DD');

    // Simuler une réponse vide pour indiquer qu'aucune réservation n'existe pour cette date
    db.get.mockResolvedValueOnce({ empty: true });
    // Simuler une réponse pour add() pour imiter la création d'une réservation
    db.add.mockResolvedValueOnce({ id: 'someReservationId' });

    const response = await supertest(app)
      .post('/reservations')
      .send({
        name: 'John',
        firstName: 'Doe',
        shortId: 'short123',
        email: 'john.doe@example.com',
        formData: {
          numberOfFloors: '3',
          sizeRange: 'medium',
          fruitBasketSelected: false,
          beforeOrAfter: 'before',
        },
        bookingFormData: {
          country: 'France',
          city: 'Paris',
          address: '123 Main St',
          address2: '',
          specialInstructions: '',
          phone: '0123456789',
        },
        quote: 100,
        serviceDate: futureDate, // Utilisez une date future
      });

      console.log(response.body); // Ajouter ce log pour voir le message d'erreur retourné


    expect(response.status).toBe(201);
    expect(response.body.message).toContain('Reservation created successfully');
  });

  it('should fail to create a reservation for a past date', async () => {
    const pastDate = dayjs('2020-01-01').format('YYYY-MM-DD');

    const response = await supertest(app)
      .post('/reservations')
      .send({
        name: 'John',
        firstName: 'Doe',
        shortId: 'short123',
        email: 'john.doe@example.com',
        formData: {
          numberOfFloors: '3',
          sizeRange: 'medium',
          fruitBasketSelected: false,
          beforeOrAfter: 'before',
        },
        bookingFormData: {
          country: 'France',
          city: 'Paris',
          address: '123 Main St',
          address2: '',
          specialInstructions: '',
          phone: '0123456789',
        },
        quote: 100,
        serviceDate: pastDate, // Utilisez une date passée
        clientId: 'clientId123'
      });



    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Validation error');
  });

  it('should fail to create a reservation for a date that is already reserved', async () => {
    const futureDate = dayjs().add(30, 'day').format('YYYY-MM-DD');

    // Simuler une réponse pour indiquer qu'une réservation existe déjà pour cette date
    db.get.mockResolvedValueOnce({ empty: false });

    const response = await supertest(app)
      .post('/reservations')
      .send({
        name: 'John',
        firstName: 'Doe',
        shortId: 'short123',
        email: 'john.doe@example.com',
        formData: {
          numberOfFloors: '3',
          sizeRange: 'medium',
          fruitBasketSelected: false,
          beforeOrAfter: 'before',
        },
        bookingFormData: {
          country: 'France',
          city: 'Paris',
          address: '123 Main St',
          address2: '',
          specialInstructions: '',
          phone: '0123456789',
        },
        quote: 100,
        serviceDate: futureDate, // Utilisez une date future
        clientId: 'clientId123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Validation error');
  });
});
