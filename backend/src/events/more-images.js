const Message = require('../models/Message');

module.exports = (socket, data) => {
  console.log('Received join room event', JSON.stringify(data));

  let { roomID, messageID } = data;

  Message.find({ room: roomID, type: 'image', _id: { $lt: messageID } })
    .sort({ _id: -1 })
    .limit(20)
    .populate({
      path: 'author',
      select: '-email -password -friends -__v',
      populate: {
        path: 'picture',
      },
    })
    .then((images) => {
      socket.emit('more-images', { status: 200, images });
    });
};
