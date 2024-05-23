const User = require('../models/User');

module.exports = (req, res, next) => {
  User.findOne({ _id: req.user.id })
    .populate({
      path: 'favorites',
      populate: [
        {
          path: 'people',
          select: '-email -password -friends -__v',
          populate: {
            path: 'picture',
          },
        },
        {
          path: 'lastMessage',
        },
        {
          path: 'picture',
        },
      ],
    })
    .exec((err, user) => {
      if (err) return res.status(500).json({ error: true });
      if (user) res.status(200).json({ favorites: user.favorites });
    });
};
