const store = require('../../store');

module.exports = async (req, res, next) => {
  const peers = await store.peers.asyncFind({});

  res.status(200).send(peers);
};
