const Message = require('../models/Message');
const Room = require('../models/Room');
const store = require('../store');
const xss = require('xss');

module.exports = (req, res, next) => {
  const { roomID, authorID, content, type, fileID } = req.fields;

  Message({
    room: roomID,
    author: authorID,
    content: xss(content),
    type,
    file: fileID,
  })
    .save()
    .then((message) => {
      Message.findById(message._id)
        .populate({
          path: 'author',
          select: '-email -password -friends -__v',
          populate: [
            {
              path: 'picture',
            },
          ],
        })
        .populate([{ path: 'file', strictPopulate: false }])
        .then((message) => {
          Room.findByIdAndUpdate(roomID, {
            $set: { lastUpdate: message.date, lastMessage: message._id, lastAuthor: authorID },
          })
            .then((room) => {
              room.people.forEach((person) => {
                const myUserID = req.user.id;
                const personUserID = person.toString();

                if (personUserID !== myUserID) {
                  store.io.to(personUserID).emit('message-in', { status: 200, message, room });
                }
              });
              res.status(200).json({ message, room });
            })
            .catch((err) => {
              return res.status(500).json({ error: true });
            });
        })
        .catch((err) => {
          return res.status(500).json({ error: true });
        });
    })
    .catch((err) => {
      return res.status(500).json({ error: true });
    });
};
