const Joi = require('joi');

const userSchema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().min(2).max(30).required(),
    name: Joi.string().min(2).max(30).required(),
    password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@?#\$%\^&\*])/).required(),
  });

module.exports = userSchema;
