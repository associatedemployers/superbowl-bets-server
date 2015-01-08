/* jshint expr:true */
var cwd = process.cwd();

var chai    = require('chai'),
    expect  = chai.expect,
    moment  = require('moment'),
    _       = require('lodash'),
    chalk   = require('chalk'),
    winston = require('winston'),
    Promise = require('bluebird'); // jshint ignore:line

var plugins = [
  require('chai-as-promised'),
  require('chai-http')
];

plugins.map(function ( plugin ) {
  chai.use( plugin );
});

chai.request.addPromises(Promise);

var app      = require(cwd + '/app').init( require('express')() ),
    mongoose = require('mongoose');

describe('Route :: Validation', function () {
  var _user;

  /* Test support */
  before(function ( done ) {
    _user = require(cwd + '/config/user-manifest')[ 0 ];
    done();
  });

  after(function ( done ) {
    var mongoose = require('mongoose');
    mongoose.connection.db.dropDatabase(done);
  });
  /* ./ Test support */

  it('should reject invalid requests', function ( done ) {
    chai.request(app)
      .get('/api/validate')
      .then(function ( res ) {
        expect(res).to.have.status(400);
        return chai.request(app).get('/api/validate?firstName=test');
      })
      .then(function ( res ) {
        expect(res).to.have.status(400);
        return chai.request(app).get('/api/validate?lastName=test');
      })
      .then(function ( res ) {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should 404 users not found', function ( done ) {
    chai.request(app)
      .get('/api/validate?firstName=' + _user.firstName + '&lastName=bob')
      .then(function ( res ) {
        expect(res).to.have.status(404);
        done();
      });
  });

  it('should send back user data with valid request', function ( done ) {
    chai.request(app)
      .get('/api/validate?firstName=' + _user.firstName + '&lastName=' + _user.lastName)
      .then(function ( res ) {
        expect(res).to.have.status(200);
        expect(res.body.user.id).to.equal(1);
        expect(res.body.user.firstName).to.equal(_user.firstName);
        expect(res.body.user.lastName).to.equal(_user.lastName);
        expect(res.body.user.amount).to.be.a('number');
        done();
      });
  });
});
