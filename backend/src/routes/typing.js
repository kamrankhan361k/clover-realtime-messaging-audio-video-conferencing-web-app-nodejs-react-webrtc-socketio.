const store = require('../store');
const Room = require('../models/Room');

module.exports = async (req, res, next) => {
  const roomObj = req.fields.room;
  if (!roomObj) return res.status(400).send('room id required');

  const roomID = roomObj._id;
  const isTyping = req.fields.isTyping;

  if (!roomID) res.status(400).send('room id required');

  const room = await Room.findById(roomID);

  room.people.forEach((person) => {
    if (person.toString() !== req.user.id.toString())
      store.io.to(person.toString()).emit('typing', { id: req.user.id, roomID, isTyping });
  });

  res.status(200).send('ok');
};
