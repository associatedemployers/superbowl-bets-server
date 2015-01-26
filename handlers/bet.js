var winston   = require('winston').loggers.get('default'),
    chalk     = require('chalk'),
    normalize = require('../config/data-normalization'),
    respond   = require('./response'),
    appConfig = require('../config/app-config'),
    users     = require('../config/user-manifest'),
    Bet       = require('../models/bet'),
    _         = require('lodash');

exports.submit = function ( req, res, next ) {
  var payload = req.body,
      userId  = parseFloat(payload.user),
      bets    = payload.propositions;

  console.log(payload);

  if ( !bets ) {
    return respond.error.res(res, 'Please include bets in your request');
  }

  var total = bets.reduce(function ( t, v ) {
    return ( isNaN( v.wager ) ) ? t : parseFloat(v.wager) + t;
  }, 0);

  console.log(total);

  if ( total > appConfig.startingValue ) {
    return respond.error.res(res, 'You cannot wager more than you have');
  }

  var user = users[ userId - 1 ]; 

  if ( !user ) {
    return respond.error.res(res, 'Unable to find that user');
  }

  Bet.findOne({ user: userId }, function ( err, existingBet ) {
    if ( err ) {
      return respond.error.res(res, err, true);
    }

    if ( existingBet ) {
      return respond.error.res(res, 'There is already a bet for that user');
    }

    bets = bets.map(function ( bet ) {
      if ( !bet.choice || bet.choice.length < 1 ) {
        bet.choice = null;
      }

      return bet;
    });

    var bet = new Bet({
      user:    userId,
      choices: bets
    });

    bet.save(function ( err, betRecord ) {
      if ( err ) {
        return respond.error.res(res, err, true);
      }

      res.status(201).send(betRecord);
    });
  });
};
