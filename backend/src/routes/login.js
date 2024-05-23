const User = require('../models/User');
const argon2 = require('argon2');
const store = require('../store');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const isEmpty = require('../utils/isEmpty');

module.exports = (req, res, next) => {
  let { email, password } = req.fields;

  let errors = {};
  isEmpty(email) && (errors.email = 'Username (or email) required.');
  isEmpty(password) && (errors.password = 'Password required.');
  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  email = email.toLowerCase();

  const sendResponse = (user) => {
    const payload = {
      id: user._id,
      email: user.email,
      level: user.level,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      username: user.username,
    };
    jwt.sign(payload, store.config.secret, { expiresIn: 60 * 60 * 24 * 60 }, (err, token) => {
      if (err) return res.status(500).json({ token: 'Error signing token.' });
      res.status(200).json({ token });
    });
  };

  const sendError = () => res.status(400).json({ password: 'Wrong password.' });

  let query;
  if (validator.isEmail(email)) query = { email };
  else query = { username: email };

  User.findOne(query)
    .populate([{ path: 'picture', strictPopulate: false }])
    .populate([{ path: 'endpoint', strictPopulate: false }])
    .then((user) => {
      if (!user) return res.status(404).json({ email: 'User not found.' });
      argon2.verify(user.password, password).then((correct) => (correct ? sendResponse(user) : sendError()));
    });
};
