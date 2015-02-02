var winston   = require('winston').loggers.get('default'),
    chalk     = require('chalk'),
    users     = require('./config/user-manifest'),
    Bet       = require('./models/bet'),
    Prop      = require('./models/prop'),
    Promise   = require('bluebird'), // jshint ignore:line
    _         = require('lodash');

exports.getResults = function () {
  var amts = [];

  Prop.find({}, function ( err, props ) {
    if ( err ) {
      throw err;
    }

    var promises = users.map(function ( user, index ) {
      return new Promise(function ( resolve, reject ) {
        Bet.findOne({ user: index + 1 }, function ( err, bet ) {
          if ( err ) {
            throw err;
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
  });

  Promise.all( promises ).then(function ( bets ) {
    bets.forEach(function ( bet ) {
      amts.push({
        winnings: calculateWinnings( bet.choices ),
        user:     users[ bet.user - 1 ]
      });
    });

    console.log( chalk.underline.bold('Results') );

    _.sortBy(amts, 'winnings').forEach(function ( amt ) {
      console.log( amt.user.firstName, amt.user.lastName, '-', chalk.bold('$' + amt.winnings) );
    });
  }).catch(function ( err ) {
    console.error( err );
  });
};

function calculateWinnings ( choices ) {
  return choices.reduce(function ( winnings, choice ) {
    var p     = choice.proposition,
        wager = choice.wager;

    var winningChoice = _.find(p.choices, { winner: true });

    if ( !winningChoice || !wager || !choice.choice ) {
      return winnings;
    }

    quotient = winningChoice.oddsNmr / winningChoice.oddsDmr;

    return winnings + Math.floor( quotient > 1 ? quotient * wager : (quotient * wager) + wager );
  }, 0);
}