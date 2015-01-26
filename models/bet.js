/*
  Bet - Server Data Model
*/

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var createModel = require('./helpers/create-model');

var choiceSchema = new Schema({
  choice: { type: mongoose.Schema.ObjectId },
  wager:  Number,
  proposition: { type: mongoose.Schema.ObjectId, ref: 'Prop' }
}, { _id: false });

var betSchema = new Schema({
  user: Number,
  choices: [ choiceSchema ],
  time_stamp: { type: Date, default: Date.now, index: true }
});

module.exports = createModel('Bet', betSchema);
