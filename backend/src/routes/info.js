const pkg = require('../../package.json');
const store = require('../store');

module.exports = (req, res, next) => {
  res.status(200).json({
    version: pkg.version,
    build: 2,
    nodemailerEnabled: store.config.nodemailerEnabled,
  });
};
