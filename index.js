var cluster = require('cluster'),
    os      = require('os'),
    app     = require('./app');

if( cluster.isMaster ) {
  var boot = function () {
    os.cpus().forEach(function ( cpu ) {
      cluster.fork();
    });
  };

  app.registerPropositions().then( boot ).catch(function ( err ) {
    console.error('Error registering props: ' + err);
    boot();
  });
} else {
  process.title = 'SuperbowlBets Worker - ' + cluster.worker.id + ' - Node.js';

  var winston  = require('winston'),
      chalk    = require('chalk'),
      logLevel = ( process.env.environment === 'development' || process.env.environment === 'dev' ) ? 'debug' : 'info';

  winston.loggers.add('default', {
    transports: [
      new ( winston.transports.Console )({ level: logLevel })
    ]
  });

  winston = winston.loggers.get('default');

  winston.info(chalk.dim('[', cluster.worker.id, '] Starting worker ...'));

  app.registerModels();

  var express = require('express'),
      server  = app.init(express()),
      port    = process.env.port || 3000;

  server.listen(port, function () {
    winston.info(chalk.dim('[', cluster.worker.id, '] Worker listening on port:', port));
  });
}
