const Room = require('../models/Room');

module.exports = (req, res, next) => {
  let { limit } = req.fields;

  !limit && (limit = 30);

  Room.find({
    people: { $in: [req.user.id] },
    $or: [
      {
        lastMessage: { $ne: null },
      },
      {
        isGroup: true,
      },
    ],
  })
    .sort({ lastUpdate: -1 })
    .populate([{ path: 'picture', strictPopulate: false }])
    .populate({
      path: 'people',
      select: '-email -password -friends -__v',
      populate: {
        path: 'picture',
      },
    })
    .populate('lastMessage')
    .limit(limit)
    .exec((err, rooms) => {
      if (err) return res.status(500).json({ error: true });
      res.status(200).json({ limit, rooms });
    });
};
