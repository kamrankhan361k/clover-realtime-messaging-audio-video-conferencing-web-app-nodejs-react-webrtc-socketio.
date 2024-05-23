const router = require('express').Router();
const AuthCode = require('../../models/AuthCode');
const Email = require('../../models/Email');
const User = require('../../models/User');
const config = require('../../../config');
const randomstring = require('randomstring');
const moment = require('moment');
const { isEmail } = require('validator');
const isEmpty = require('../../utils/isEmpty');

router.post('*', async (req, res) => {
  let { username, email, firstName, lastName, password } = req.fields;

  if (isEmpty(username))
    return res.status(400).json({
      status: 'error',
      message: 'username required',
      username: 'username required',
    });

  if (isEmpty(email))
    return res.status(400).json({
      status: 'error',
      message: 'email required',
      email: 'email required',
    });

  if (!isEmail(email))
    return res.status(400).json({
      status: 'error',
      message: 'must be a valid email',
      email: 'must be a valid email',
    });

  if (isEmpty(firstName))
    return res.status(400).json({
      status: 'error',
      message: 'first name required',
      firstName: 'first name required',
    });

  if (isEmpty(lastName))
    return res.status(400).json({
      status: 'error',
      message: 'last name required',
      lastName: 'last name required',
    });

  if (isEmpty(password))
    return res.status(400).json({
      status: 'error',
      message: 'password required',
      password: 'password required',
    });

  if (password.length < 6) {
    return res.status(404).json({ status: 'error', password: 'password too short, must be at least 6 characters' });
  }

  email = email.toLowerCase();

  await AuthCode.updateMany({ email }, { $set: { valid: false } });

  const authCode = AuthCode({
    code: randomstring.generate({ charset: 'numeric', length: 6 }),
    valid: true,
    email,
    expires: moment().add(10, 'minutes').toDate(),
  });

  authCode.save();

  const entry = Email({
    from: config.nodemailer.from,
    to: email,
    subject: `${config.appTitle || config.appName || 'Clover'} - Verification Code`,
    html: `<p>Hello ${firstName},<br/><br/>Here is your verification code: ${authCode.code}</p>`,
  });

  entry.save();

  res.status(200).json({ status: 'status', message: 'email queued' });
});

module.exports = router;
