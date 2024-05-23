const Meeting = require('../../models/Meeting');
const xss = require('xss');

module.exports = (req, res, next) => {
  let { title, caller, callee, startedAsCall, callToGroup, group } = req.fields;

  Meeting({ title: xss(title), caller, callee, startedAsCall, callToGroup, group })
    .save()
    .then((meeting) => {
      res.status(200).json(meeting);
    });
};
