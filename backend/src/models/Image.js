const mongoose = require('./mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  shield: String,
  name: String,
  location: String,
  author: { type: Schema.ObjectId, ref: 'users' },
  size: Number,
  shieldedID: String,
});

module.exports = Image = mongoose.model('images', MessageSchema);
