const User = require('../models/User');
const argon2 = require('argon2');
const validator = require('validator');
const xss = require('xss');

module.exports = async (req, res, next) => {
  let username = xss(req.fields.username);
  let email = xss(req.fields.email);
  let firstName = xss(req.fields.firstName);
  let lastName = xss(req.fields.lastName);
  let { password, repeatPassword, user } = req.fields;

  if (!req.user.level === 'root') return res.status(401).send('401 Unauthorized User');

  let errors = {};

  if (password !== repeatPassword) {
    errors.password = 'Passwords not matching';
    errors.repeatPassword = 'Passwords not matching';
  }

  !validator.isEmail(email) && (errors.email = 'Invalid email.');

  email = email.toLowerCase();

  const isUsername = await User.findOne({ username });
  if (isUsername && username !== user.username) errors.username = 'Username taken.';

  const isEmail = await User.findOne({ email });
  if (isEmail && email !== user.email) errors.email = 'Email already in use.';

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  let query = { username: xss(username), email: xss(email), firstName: xss(firstName), lastName: xss(lastName) };

  if (typeof password === 'string' && password.length > 0) {
    argon2.hash(password).then((hash) => {
      query = { ...query, password: hash };
      User.findOneAndUpdate({ email }, { $set: query }, { new: true }).then((user) => res.status(200).json(user));
    });
  } else {
    User.findOneAndUpdate({ email }, { $set: query }, { new: true }).then((user) => res.status(200).json(user));
  }
};
