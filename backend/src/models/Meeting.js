const mongoose = require('./mongoose');
const Schema = mongoose.Schema;

const MeetingSchema = new Schema({
  title: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  lastEnter: {
    type: Date,
    default: Date.now,
  },
  lastLeave: {
    type: Date,
    default: Date.now,
  },
  startedAsCall: {
    type: Boolean,
    default: false,
  },
  caller: { type: Schema.ObjectId, ref: 'users' },
  callee: { type: Schema.ObjectId, ref: 'users' },
  callToGroup: {
    type: Boolean,
    default: false,
  },
  group: { type: Schema.ObjectId, ref: 'rooms' },
  peers: {
    type: Array,
    default: [],
  },
  users: [{ type: Schema.ObjectId, ref: 'users' }],
});

module.exports = User = mongoose.model('meetings', MeetingSchema);
