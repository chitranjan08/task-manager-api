const Joi = require('joi');
const passwordRegex = /^(?![!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{6,}$/;
const registerSchema = Joi.object({
   name:Joi.string().min(3).required(true),
   email:Joi.string().email().required(),
    password: Joi.string()
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase, one lowercase, one special character and should not start with a special character',
    }),
    role: Joi.string().valid('user', 'admin', 'manager').default('user')
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports={loginSchema,registerSchema}