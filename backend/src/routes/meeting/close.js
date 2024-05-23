const Meeting = require('../../models/Meeting');
const Room = require('../../models/Room');
const xss = require('xss');
const store = require('../../store');

module.exports = (req, res, next) => {
  let { userID, meetingID } = req.fields;

  store.io.to(userID).emit('close', { status: 200, meetingID, counterpart: req.user.id });

  res.status(200).json({ ok: true });
};
