const User = require('../models/User');
const argon2 = require('argon2');
const validator = require('validator');
const isEmpty = require('../utils/isEmpty');
const xss = require('xss');

module.exports = async (req, res, next) => {
  let { username, email, firstName, password, repeatPassword, phone, lastName } = req.fields;

  let errors = {};
  isEmpty(username) && (errors.username = 'Username required.');
  isEmpty(email) && (errors.email = 'Email required.');
  isEmpty(firstName) && (errors.firstName = 'First name required.');
  isEmpty(password) && (errors.password = 'Password required.');
  isEmpty(lastName) && (errors.lastName = 'Last name required.');
  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  if (password !== repeatPassword) {
    errors.password = 'Passwords not matching';
    errors.repeatPassword = 'Passwords not matching';
  }

  !validator.isEmail(email) && (errors.email = 'Invalid email.');

  email = email.toLowerCase();

  const isUsername = await User.findOne({ username });
  if (isUsername) errors.username = 'Username taken.';

  const isEmail = await User.findOne({ email });
  if (isEmail) errors.email = 'Email already in use.';

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  argon2
    .hash(password)
    .then((hash) =>
      new User({
        username: xss(username),
        email: xss(email),
        firstName: xss(firstName),
        password: hash,
        phone: xss(phone),
        lastName: xss(lastName),
        lastOnline: Date.now(),
      })
        .save()
        .then((user) => res.status(200).json(user)),
    );
};
