const Message = require('../models/Message');

module.exports = (socket, data) => {
  console.log('Received join room event', JSON.stringify(data));

  let { roomID, messageID } = data;

  Message.find({ room: roomID, _id: { $lt: messageID } })
    .sort({ _id: -1 })
    .limit(20)
    .populate({
      path: 'author',
      select: '-email -password -friends -__v',
      populate: {
        path: 'picture',
      },
    })
    .then((messages) => {
      messages.reverse();
      socket.emit('more-messages', { status: 200, messages });
    });
};
