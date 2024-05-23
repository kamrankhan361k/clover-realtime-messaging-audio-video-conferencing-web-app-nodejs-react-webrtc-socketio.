const User = require('../models/User');

module.exports = (req, res, next) => {
  let { roomID } = req.fields;

  User.findOne({ _id: req.user.id })
    .then((user) => {
      let update;
      if (user.favorites.includes(roomID)) update = { $pull: { favorites: roomID } };
      else update = { $push: { favorites: roomID } };
      User.findOneAndUpdate({ _id: req.user.id }, update, { new: true })
        .populate({
          path: 'favorites',
          populate: [
            {
              path: 'people',
              select: '-email -tagLine -password -friends -__v',
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
        .then((user) => {
          res.status(200).json({ favorites: user.favorites, roomID });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: true });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: true });
    });
};
