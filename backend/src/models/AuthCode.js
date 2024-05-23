const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const AuthCodeSchema = new Schema({
  expires: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: ObjectId,
    ref: 'User',
    required: false,
  },
  code: String,
  valid: Boolean,
  email: String,
});

const AuthCode = mongoose.model('AuthCode', AuthCodeSchema);

module.exports = AuthCode;
