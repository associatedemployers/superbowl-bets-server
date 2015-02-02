var winston   = require('winston').loggers.get('default'),
    chalk     = require('chalk'),
    startVal  = require('./config/app-config').startingValue,
    users     = require('./config/user-manifest'),
    Bet       = require('./models/bet'),
    Prop      = require('./models/prop'),
    Promise   = require('bluebird'), // jshint ignore:line
    _         = require('lodash');

require('./config/mongoose').init();

exports.getResults = function () {
  return new Promise(function ( resolve, reject ) {
    var amts = [];

    console.log('Finding props');

    Prop.find({}, function ( err, props ) {
      console.log('Found props');

      if ( err ) {
        throw err;
      }

      var promises = users.map(function ( user, index ) {
        return new Promise(function ( resolve, reject ) {
          console.log('finding bet for ', user);
          Bet.findOne({ user: index + 1 }, function ( err, bet ) {
            if ( err ) {
              throw err;
            }

            if ( !bet ) {
              return resolve();
            }

            var plainBet = bet.toObject();

            plainBet.choices.map(function ( choice ) {
              var pid = choice.proposition.toString();

              choice.proposition = _.find(props, function ( prop ) {
                return prop._id.toString() === pid;
              });

              return choice;
            });

            resolve( plainBet );
          });
        });
      });

      Promise.all( promises ).then(function ( bets ) {
        bets.forEach(function ( bet ) {
          if ( !bet ) {
            return;
          }

          amts.push({
            winnings: calculateWinnings( bet.choices ),
            user:     users[ bet.user - 1 ]
          });
        });

        console.log( chalk.underline.bold('Results') );

        _.sortBy(amts, 'winnings').forEach(function ( amt ) {
          console.log( amt.user.firstName, amt.user.lastName, '-', chalk.bold('$' + amt.winnings) );
        });

        resolve(_.sortBy(amts, 'winnings'));
      }).catch(function ( err ) {
        console.error( err );
      });
    });
  });
};

function calculateWinnings ( choices ) {
  var winnings = choices.reduce(function ( winnings, choice ) {
    var p     = choice.proposition,
        wager = choice.wager;

    var winningChoice = _.find(p.choices, { winner: true });

    if ( !winningChoice || !wager || !choice.choice ) {
      return winnings;
    }

    quotient = winningChoice.oddsNmr / winningChoice.oddsDmr;

    return winnings + Math.floor( quotient > 1 ? quotient * wager : (quotient * wager) + wager );
  }, 0);

  var remaining = choices.reduce(function ( val, choice ) {
    return val - choice.wager;
  }, startingVal);

  console.log(remaining);

  return remaining + winnings;
}
