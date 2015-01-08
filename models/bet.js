/*
  Bet - Server Data Model
*/

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var createModel = require('./helpers/create-model');

var betSchema = new Schema({
  user: Number,
  time_stamp: { type: Date, default: Date.now, index: true }
});

module.exports = createModel('Bet', betSchema);
