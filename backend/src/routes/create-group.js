const Room = require('../models/Room');
const xss = require('xss');

module.exports = (req, res) => {
  let { people, title, picture } = req.fields;

  Room({ people: people, isGroup: true, title: xss(title), picture })
    .save()
    .then((room) => {
      Room.findOne({ _id: room._id })
        .populate('people')
        .then((room) => {
          res.status(200).json(room);
        });
    });
};
