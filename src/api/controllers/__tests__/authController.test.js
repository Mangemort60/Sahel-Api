const request = require('supertest')
const app = require('../../../app')
const Joi = require('joi')
const userSchema = require('../../../models/userModel')

describe('User registration', () => {
    it('should register a user successfully with valid data', async () => {
      const data = {
        email: "johndoe@example.com",
        firstName: "John",
        name: "Doe",
        password: "StrongPassword123!",
      };
  
      const response = await registerUser(data);
  
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('uid');
    });
  });
  
