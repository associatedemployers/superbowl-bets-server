var express    = require('express'),
    betHandler = require('../handlers/bet');

module.exports = function ( app ) {
  var betRouter = express.Router();

  betRouter.post('/', betHandler.submit);
  betRouter.get('/:id', betHandler.fetchByID);

  app.use('/api/bets', betRouter);
};
