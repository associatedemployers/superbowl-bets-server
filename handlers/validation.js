var winston   = require('winston').loggers.get('default'),
    chalk     = require('chalk'),
    normalize = require('../config/data-normalization'),
    respond   = require('./response'),
    _         = require('lodash');

var Bet       = require(process.cwd() + '/models/bet'),
    users     = require(process.cwd() + '/config/user-manifest'),
    appConfig = require(process.cwd() + '/config/app-config');

exports.validate = function ( req, res, next ) {
  var firstName = req.query.firstName,
      lastName  = req.query.lastName;

  if( !firstName || !lastName ) {
    return respond.error.res(res, 'Please provide a first and last name in your request');
  }

  var userIndex = _.findIndex(users, {
    firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase(),
    lastName:  lastName.charAt(0).toUpperCase()
  });

  var user = ( userIndex > -1 ) ? users[ userIndex ] : undefined;

  if( !user ) {
    return respond.code.notfound(res);
  }

  Bet.findOne({ user: userIndex + 1 }, function ( err, bet ) {
    if ( err ) {
      return respond.error.res( res, err, true );
    }

    var ret = {
      status: 'ok',
      user: {
        id:        userIndex + 1,
        firstName: user.firstName,
        lastName:  user.lastName,
        amount:    appConfig.startingValue
      }
    };

    if ( bet ) {
      ret.bet = bet._id.toString();
    }

    res.status(200).send( ret );
  });
};
