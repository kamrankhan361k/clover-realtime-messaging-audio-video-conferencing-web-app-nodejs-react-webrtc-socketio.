const Message = require('../models/Message');
const Room = require('../models/Room');

module.exports = async (req, res, next) => {
  let { id } = req.fields;

  try {
    await Room.findOneAndDelete({ _id: id });
  } catch (e) {
    return res.status(404).json({ status: 'error', message: 'room not found' });
  }

  try {
    await Message.deleteMany({ room: id });
  } catch (e) {
    return res.status(404).json({ status: 'error', message: 'error while deleting messages' });
  }

  res.status(200).json({ status: 'success', message: 'room deleted' });
};
