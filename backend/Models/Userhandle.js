const mongoose = require('mongoose');

const Userhandleschema = new mongoose.Schema({
  handle:      { type: String, required: true, index: true },
  contestId:   { type: String, required: true },
  contestName: { type: String },
  oldRating:   { type: Number },
  newRating:   { type: Number },
  ratingChange:{type:Number},
  rank:        { type: Number },   
  user_newrank:{type:String}, 
  user_oldrank:{type:String},
  Contestdate: { type: Date },
}, { timestamps: true });

Userhandleschema.index({ handle: 1, contestId: 1 }, { unique: true });
Userhandleschema.index({ handle: 1, Contestdate: 1 });
module.exports = mongoose.model('UserhandleSchema', Userhandleschema);
