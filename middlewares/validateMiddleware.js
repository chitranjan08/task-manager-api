const AppError = require('../utils/AppError');
const ERROR_CODES = require('../utils/errorCodes');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const formattedErrors = error.details.map(detail => {
        const field = detail.context.label || detail.path[0];
        const message = detail.message.replace(/\"/g, '');
        return {
          field,
          message: message.charAt(0).toUpperCase() + message.slice(1)
        };
      });

      // Instead of throwing, pass the array via AppError as a custom `errors` property
      const err = new AppError('Validation failed', 422, ERROR_CODES.VALIDATION_ERROR);
      err.errors = formattedErrors;
      return next(err);
    }

    next();
  };
};

module.exports = validate;
