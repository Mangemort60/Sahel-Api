const Joi = require('joi').extend(require('joi-phone-number'))


const userSchema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().min(2).max(30).required(),
    name: Joi.string().min(2).max(30).required(),
    password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@?#\$%\^&\*])/).required(),
    phone: Joi.string().phoneNumber({ defaultCountry: 'FR', format: 'international' }).required(),    
  });

module.exports = userSchema;
