/*
  Proposition - Server Data Model
*/

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var createModel = require('./helpers/create-model');

var choiceSchema = new Schema({
  title: String,

  // Win vs. Loss risk
  oddsNmr: Number, // Numerator
  oddsDmr: Number, // Denominator

  winner: Boolean,

  numberOfBets: { type: Number, default: 0 }
});

var propSchema = new Schema({
  title:      String,
  helper:     String,
  choices:    [ choiceSchema ],
  time_stamp: { type: Date, default: Date.now, index: true }
});

module.exports = createModel('Prop', propSchema);
