// schemas/contactSchema.js
const Joi = require('joi');

const contactSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  }),
  firstname: Joi.string().min(1).required().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  phoneNumber: Joi.string().pattern(/^\d+$/).min(10).required().messages({
    'string.pattern.base': 'Phone number must contain only digits',
    'string.min': 'Phone number must be at least 10 digits',
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required',
  }),
  details: Joi.string().min(1).required().messages({
    'string.empty': 'Details are required',
    'any.required': 'Details are required',
  }),
});

module.exports = contactSchema;
