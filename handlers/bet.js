var winston   = require('winston').loggers.get('default'),
    chalk     = require('chalk'),
    normalize = require('../config/data-normalization'),
    respond   = require('./response'),
    appConfig = require('../config/app-config'),
    users     = require('../config/user-manifest'),
    Bet       = require('../models/bet'),
    Prop      = require('../models/prop'),
    Promise   = require('bluebird'), // jshint ignore:line
    _         = require('lodash');

var ObjectId       = require('mongoose').Types.ObjectId,
    ResourceMixin  = require('../lib/mixins/resource-handler');

exports.fetchByID = function ( req, res, next ) {
  var id = req.params.id;

  if ( !id ) {
    return respond.error.res(res, 'Invalid request');
  }

  Bet.findById(id, function ( err, bet ) {
    if ( err ) {
      return respond.error.res(res, err, true);
    }

    if ( !bet ) {
      return respond.code.notfound( res );
    }

    bet = bet.toObject();

    Promise.all(bet.choices.map(function ( choice, index ) {
      return new Promise(function ( resolve, reject ) {
        Prop.findById(choice.proposition, function ( err, prop ) {
          if ( err ) {
            throw err;
          }

          choice.proposition = prop;
          choice.choice = ( choice.choice ) ? _.find(prop.choices, function ( c ) {
            return c._id.toString() === choice.choice.toString();
          }) : choice.choice;
          choice.id = index;

          resolve(choice);
        });
      });
    })).then(function ( result ) {
      bet.choices = result;

      res.status(200).send({
        bet: bet
      });
    }).catch(function ( err ) {
      respond.error.res(res, err, true);
    });
  });
};

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

      _markChoices(bets.reduce(function ( ret, item ) {
        if ( item.choice ) {
          ret.push({
            prop:   item.proposition,
            choice: item.choice
          });
        }

        return ret;
      }, []));
    });
  });
};

function _markChoices ( choices ) {
  if ( !_.isArray(choices) || choices.length < 1 ) {
    return;
  }

  Promise.all(choices.map(function ( choice ) {
    return new Promise(function ( resolve, reject ) {
      Prop.findById( choice.prop, function ( err, prop ) {
        if ( err ) {
          return reject( err );
        }

        if ( !prop ) {
          return resolve();
        }

        _choiceIndex = _.findIndex(prop.choices, function ( propChoice ) {
          return propChoice._id.toString() === choice.choice.toString();
        });

        if ( _choiceIndex < 0 ) {
          return resolve();
        }

        prop.choices[ _choiceIndex ].numberOfBets = prop.choices[ _choiceIndex ].numberOfBets + 1;
      
        prop.save(function ( err, p ) {
          if ( err ) {
            reject( err );
          } else {
            resolve( p );
          }
        });
      });
    });
  })).then(function ( results ) {
    console.log('Marked', results.length, 'propositions...');
  }).catch(function ( err ) {
    console.error('Error marking props:', err);
  });
}
