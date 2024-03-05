const supertest = require('supertest');
const  app  = require('../../../app'); // Assurez-vous que le chemin d'accès à votre application Express est correct
const { db } = require('../../../config/firebaseConfig');

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
  it('should successfully create a reservation for a valid future date', async () => {
    // Générer dynamiquement une date future (par exemple, 30 jours à partir d'aujourd'hui)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateString = futureDate.toISOString().split('T')[0]; // Convertir en chaîne de caractères YYYY-MM-DD

    // Simuler une réponse vide pour indiquer qu'aucune réservation n'existe pour cette date
    db.get.mockResolvedValueOnce({ empty: true });
    // Simuler une réponse pour add() pour imiter la création d'une réservation
    db.add.mockResolvedValueOnce({ id: 'someReservationId' });

    const response = await supertest(app)
      .post('/reservations')
      .send({
        areaSize: 'lessThan40',
        fruitsBasketSelected: false,
        nbrOfStageToClean: 2,
        serviceDate: futureDate, // Utilisez une date future
        clientId: 'clientId123'
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toContain('Reservation created successfully');
  });

  it('should fail to create a reservation for a past date', async () => {
    const response = await supertest(app)
      .post('/reservations')
      .send({
        areaSize: 'lessThan40',
        fruitsBasketSelected: false,
        nbrOfStageToClean: 2,
        serviceDate: '2020-01-01', // Utilisez une date passée
        clientId: 'clientId123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('The service date cannot be in the past or today.');
  });

  // Ajoutez plus de tests selon les besoins, par exemple pour tester les dates déjà réservées
});
