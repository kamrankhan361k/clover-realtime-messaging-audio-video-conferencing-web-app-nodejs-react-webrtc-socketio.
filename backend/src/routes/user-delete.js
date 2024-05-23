const User = require('../models/User');
const store = require('../store');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const isEmpty = require('../utils/isEmpty');
const xss = require('xss');

module.exports = (req, res, next) => {
  console.log(req.fields);
  let email = xss(req.fields.email);

  if (!req.user.level === 'root') return res.status(401).send('401 Unauthorized User');

  let errors = {};
  isEmpty(email) && (errors.email = 'Email required.');
  !validator.isEmail(email) && (errors.email = 'Invalid email.');
  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  email = email.toLowerCase();

  User.findOneAndDelete({ email }).then((result) => {
    if (!result) return res.status(404).json({ email: 'User not found.' });
    store.io.to(result._id).emit('user-deleted', { id: result._id });
    res.status(200).json({ result });
  });
};
