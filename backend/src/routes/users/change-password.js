const argon2 = require('argon2');
const isEmpty = require('../../utils/isEmpty');
const User = require('../../models/User');

module.exports = async (req, res) => {
  const { password } = req.fields;

  let user;

  try {
    user = await User.findById(req.user.id);
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'database read error' });
  }

  if (!user) {
    return res.status(404).json({ status: 'error', message: 'user not found' });
  }

  if (password.length < 6) {
    return res.status(404).json({ status: 'error', password: 'password too short, must be at least 6 characters' });
  }

  if (!isEmpty(password)) user.password = await argon2.hash(password);

  try {
    await user.save();
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'database write error' });
  }

  user = await User.findById(req.user.id);

  res.status(200).json({ status: 'success', user });
};
