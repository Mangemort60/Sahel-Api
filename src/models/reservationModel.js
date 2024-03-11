const Joi = require('joi');

const reservationSchema = Joi.object({
  areaSize: Joi.number().required(),
  fruitsBasketSelected: Joi.boolean().required(),
  nbrOfStageToClean: Joi.number().required(),
  serviceDate: Joi.date().greater('now').required(),
  clientId: Joi.string().required(),
  address: Joi.string().required(),
  addressComplement: Joi.string().allow('', null),
  phoneNumber: Joi.string().pattern(new RegExp('^\\d{10}$')), // Adaptez selon le format de numéro souhaité
  specialInstructions: Joi.string().allow('', null).max(250),
  shortId: Joi.string().required()
});

module.exports = reservationSchema;
