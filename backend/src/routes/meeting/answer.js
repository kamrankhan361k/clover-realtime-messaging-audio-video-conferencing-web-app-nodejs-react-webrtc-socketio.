const Meeting = require('../../models/Meeting');
const Room = require('../../models/Room');
const xss = require('xss');
const store = require('../../store');

module.exports = (req, res, next) => {
  let { userID, meetingID, answer } = req.fields;

  store.io.to(userID).emit('answer', { status: 200, meetingID, answer, callee: req.user.id });

  res.status(200).json({ ok: true });
};
