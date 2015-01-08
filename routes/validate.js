var express           = require('express'),
    validationHandler = require('../handlers/validation');

module.exports = function ( app ) {
  var validationRouter = express.Router();

  validationRouter.get('/', validationHandler.validate);

  app.use('/api/validate', validationRouter);
};
