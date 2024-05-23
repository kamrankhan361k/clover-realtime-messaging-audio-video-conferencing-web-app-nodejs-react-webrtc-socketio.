const router = require('express').Router();
const AuthCode = require('../../models/AuthCode');
const Email = require('../../models/Email');
const User = require('../../models/User');
const config = require('../../../config');
const randomstring = require('randomstring');
const moment = require('moment');
const isEmpty = require('../../utils/isEmpty');

router.post('*', async (req, res) => {
  let { email } = req.fields;

  if (isEmpty(email)) {
    return res.status(400).json({ status: 'error', email: 'email required' });
  }

  let user;

  try {
    user = await User.findOne({ email });
  } catch (e) {
    return res.status(404).json({ status: 'error', email: 'error while reading database' });
  }

  if (!user) {
    return res.status(404).json({ status: 'error', email: 'no user matches this email address' });
  }

  await AuthCode.updateMany({ user }, { $set: { valid: false } });

  const authCode = AuthCode({
    code: randomstring.generate({ charset: 'numeric', length: 6 }),
    valid: true,
    user: user._id,
    expires: moment().add(10, 'minutes').toDate(),
  });

  authCode.save();

  const entry = Email({
    from: config.nodemailer.from,
    to: user.email,
    subject: `${config.appTitle || config.appName || 'Clover'} - Authentication Code`,
    html: `<p>Hello ${user.firstName},<br/><br/>Here is your authentication code: ${authCode.code}</p>`,
  });

  entry.save();

  res.status(200).json({ status: 'status', message: 'email queued' });
});

module.exports = router;
