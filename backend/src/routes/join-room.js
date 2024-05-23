const Message = require('../models/Message');
const Room = require('../models/Room');

module.exports = (req, res, next) => {
  let { id } = req.fields;

  const findMessagesAndEmit = (room) => {
    Message.find({ room: room._id })
      .sort({ _id: -1 })
      .limit(50)
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
      .lean()
      .then((messages) => {
        messages.reverse();
        Message.find({ room: room._id, type: 'image' })
          .sort({ _id: -1 })
          .limit(50)
          .populate({
            path: 'author',
            select: '-email -password -friends -__v',
            populate: {
              path: 'picture',
            },
          })
          .then((images) => {
            res.status(200).json({
              room: {
                _id: room._id,
                people: room.people,
                title: room.title,
                isGroup: room.isGroup,
                lastUpdate: room.lastUpdate,
                lastAuthor: room.lastAuthor,
                lastMessage: room.lastMessage,
                picture: room.picture,
                messages: messages.map((e) => {
                  if (e.author) {
                    return e;
                  } else {
                    return {
                      ...e,
                      author: {
                        firstName: 'Deleted',
                        lastName: 'User',
                      },
                    };
                  }
                }),
                images,
              },
            });
          });
      });
  };

  Room.findOne({ _id: id })
    .populate([{ path: 'picture', strictPopulate: false }])
    .populate({
      path: 'people',
      select: '-email -tagLine -password -friends -__v',
      populate: [
        {
          path: 'picture',
        },
      ],
    })
    .exec((err, room) => {
      if (err || !room) {
        console.log(err);
        return res.status(404).json({ error: true });
      }
      if (room.people.filter((person) => req.user.id.toString() === person._id.toString()).length === 0) {
        return res.status(404).json({ error: true });
      }
      findMessagesAndEmit(room);
    });
};
