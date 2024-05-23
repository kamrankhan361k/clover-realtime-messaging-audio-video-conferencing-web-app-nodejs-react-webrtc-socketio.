const store = require('../../store');

module.exports = async (req, res, next) => {
  const { id } = req.fields;

  let room;

  try {
    room = await store.rooms.asyncFindOne({ _id: id });
    if (!room.users.includes(req.user.id)) {
      await store.rooms.asyncUpdate({ _id: id }, { $push: { users: req.user.id } });
      room = await store.rooms.asyncFindOne({ _id: id });
    }
  } catch (e) {
    console.log(e);
  }

  res.status(200).json(room);
};
