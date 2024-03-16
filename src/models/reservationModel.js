const Joi = require('joi');

const reservationSchema = Joi.object({
  formData: Joi.object({
    numberOfFloors: Joi.string().required(),
    sizeRange: Joi.string().required(),
    fruitBasketSelected: Joi.boolean().required(),
    beforeOrAfter: Joi.string().required(),
  }).required(),
  bookingFormData: Joi.object({
    country: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().required(),
    address2: Joi.string().allow(''), // Permet les chaînes vides
    specialInstructions: Joi.string().allow(''),
    phone: Joi.string().pattern(/^[0-9]+$/).required(), // Assure que le téléphone ne contient que des chiffres
  }).required(),
  quote: Joi.number().required(),
  serviceDate: Joi.date().required(),
});

module.exports = reservationSchema