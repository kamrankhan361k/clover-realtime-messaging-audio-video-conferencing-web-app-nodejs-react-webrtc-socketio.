const User = require('../models/User');

module.exports = async (req, res, next) => {
  let { id } = req.fields;

  User.findOne({ _id: id })
    .then((user) => res.status(200).json(user))
    .catch(() => res.status(404).json({ error: 'User not found' }));
};
