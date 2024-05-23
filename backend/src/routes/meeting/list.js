const Meeting = require('../../models/Meeting');

module.exports = (req, res, next) => {
  let { limit } = req.fields;

  !limit && (limit = 30);

  Meeting.find({
    $or: [{ users: { $in: [req.user.id] } }, { caller: req.user.id }, { callee: req.user.id }],
  })
    .sort({ lastEnter: -1 })
    .populate({
      path: 'users',
      select: '-email -password -friends -__v',
      populate: {
        path: 'picture',
      },
    })
    .populate([{ path: 'caller', strictPopulate: false }])
    .populate([{ path: 'callee', strictPopulate: false }])
    .populate('group')
    .limit(limit)
    .exec((err, meetings) => {
      if (err) return res.status(500).json({ error: true });
      res.status(200).json({ limit, meetings });
    });
};
