const User = require('../../models/User');
const Room = require('../../models/Room');
const xss = require('xss');
const store = require('../../store');

module.exports = async (req, res, next) => {
  let { userID, meetingID } = req.fields;

  const user = await User.findOne({ _id: req.user.id }, { email: 0, password: 0, friends: 0, __v: 0 }).populate([
    { path: 'picture', strictPopulate: false },
  ]);

  store.io
    .to(userID)
    .emit('call', { status: 200, meetingID, roomID: null, caller: req.user.id, counterpart: user, added: true });

  res.status(200).json({ ok: true });
};
