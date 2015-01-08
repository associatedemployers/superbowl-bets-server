var express     = require('express'),
    propHandler = require('../handlers/prop');

module.exports = function ( app ) {
  var propRouter = express.Router();

  propRouter.get('/', propHandler.fetchAll);
  propRouter.get('/:id', propHandler.fetchByID);

  app.use('/api/props', propRouter);
};
