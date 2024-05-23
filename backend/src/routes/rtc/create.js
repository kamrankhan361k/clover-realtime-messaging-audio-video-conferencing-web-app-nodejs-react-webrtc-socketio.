const store = require('../../store');

module.exports = async (req, res, next) => {
  const room = await store.rooms.asyncInsert({
    users: [req.user.id],
  });

  res.status(200).send(room);
};
