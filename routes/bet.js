var express    = require('express'),
    betHandler = require('../handlers/bet');

module.exports = function ( app ) {
  var betRouter = express.Router();

  betRouter.get('/', betHandler.fetchAll);
  betRouter.get('/:id', betHandler.fetchByID);
  betRouter.post('/', betHandler.create);

  app.use('/api/bets', betRouter);
};
