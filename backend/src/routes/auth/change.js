const router = require('express').Router();
const AuthCode = require('../../models/AuthCode');
const Email = require('../../models/Email');
const User = require('../../models/User');
const config = require('../../../config');
const moment = require('moment');
const argon2 = require('argon2');

router.post('*', async (req, res) => {
  let { code, email, password } = req.fields;

  let user;
  let authCode;

  if (!email) {
    return res.status(404).json({ status: 'error', code: 'email required' });
  }

  if (!code) {
    return res.status(404).json({ status: 'error', code: 'auth code required' });
  }

  try {
    user = await User.findOne({ email });
  } catch (e) {
    return res.status(404).json({ status: 'error', code: 'error while reading database' });
  }

  if (!user) {
    return res.status(404).json({ status: 'error', code: 'the associated user is no longer valid' });
  }

  try {
    authCode = await AuthCode.findOne({ code, user, valid: true });
  } catch (e) {
    return res.status(404).json({ status: 'error', code: 'error while reading database' });
  }

  if (!authCode) {
    return res.status(404).json({ status: 'error', code: 'auth code not found' });
  }

  if (moment(authCode.expires).isBefore(moment())) {
    return res.status(404).json({ status: 'error', code: 'auth code expired' });
  }

  if (password.length < 6) {
    return res.status(400).json({ status: 'error', password: 'password too short, must be at least 6 characters' });
  }

  user.password = await argon2.hash(password);

  await user.save();

  const entry = Email({
    from: config.nodemailer.from,
    to: user.email,
    subject: `${config.appTitle || config.appName || 'Clover'} - Password changed`,
    html: `<p>Hello ${user.firstName},<br/><br/>Your password has been changed!<br/><br/>Timestamp: ${moment().format(
      'HH:mm - D MMMM YYYY',
    )}</p>`,
  });

  entry.save();

  res.status(200).json({ status: 'status', message: 'email queued' });
});

module.exports = router;
