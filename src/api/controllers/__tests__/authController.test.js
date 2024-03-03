const request = require('supertest')
const app = require('../../../app')

describe('POST /register', () => {
  it('should register a user successfully', async () => {
    const response = await request(app)
      .post('/auth/register') // Remplacez '/register' par le chemin réel vers votre endpoint
      .send({
        email: `test${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Test User',
        firstName: 'Test',
      });

    expect(response.statusCode).toBe(201);
    expect(response.text).toEqual('User created successfully.');
    // Vous pouvez ajouter d'autres assertions ici selon la logique de votre application
  });
  it('should return 400 for invalid form submission', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        // Envoyez des données invalides selon votre schéma de validation
        // Par exemple, omettez le champ 'email' ou fournissez un format d'email invalide
        email: 'invalidEmail', // Format d'email invalide
        password: 'pass', // Supposons que votre validation exige un mot de passe plus long
        name: 'ha', // Nom manquant
        firstName: 'Test',
      });

      expect(response.statusCode).toBe(400);

  })
});
