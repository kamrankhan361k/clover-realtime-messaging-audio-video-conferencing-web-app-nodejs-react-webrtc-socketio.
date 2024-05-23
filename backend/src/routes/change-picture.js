const User = require('../models/User');

module.exports = (req, res, next) => {
  let { imageID } = req.fields;

  console.log('change picture for user ' + req.user.email);

  User.findOneAndUpdate({ _id: req.user.id }, { $set: { picture: imageID } }, { new: true })
    .populate([{ path: 'picture', strictPopulate: false }])
    .exec((err, user) => {
      if (err) return res.status(500).json({ error: true });
      res.status(200).json(user.picture);
    });
};
