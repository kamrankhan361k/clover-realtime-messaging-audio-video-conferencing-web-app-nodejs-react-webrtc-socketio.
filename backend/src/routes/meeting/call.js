const User = require('../../models/User');
const Room = require('../../models/Room');
const xss = require('xss');
const store = require('../../store');

module.exports = async (req, res, next) => {
  let { roomID, meetingID } = req.fields;

  const user = await User.findOne({ _id: req.user.id }, { email: 0, password: 0, friends: 0, __v: 0 }).populate([
    { path: 'picture', strictPopulate: false },
  ]);

  Room.findOne({ _id: roomID })
    .populate({
      path: 'people',
      select: '-email -password -friends -__v',
      populate: [
        {
          path: 'picture',
        },
      ],
    })
    .then((room) => {
      room.people.forEach((person) => {
        const myUserID = req.user.id;
        const personUserID = person._id.toString();

        if (personUserID !== myUserID) {
          store.io
            .to(personUserID)
            .emit('call', { status: 200, room, meetingID, roomID, caller: req.user.id, counterpart: user });
        }
      });

      res.status(200).json({ ok: true });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: true });
    });
};
