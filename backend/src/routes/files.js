const File = require('../models/File');
const fs = require('fs');

module.exports = (req, res, next) => {
  const { id } = req.params;

  File.findOne({ shieldedID: id })
    .then((descriptor) => {
      if (!descriptor) return res.status(500);

      let location = descriptor.location;

      fs.access(location, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(err);
          // TODO handle missing file
        }

        fs.createReadStream(location).pipe(res);
        res.set('Content-type', descriptor.type);
        res.status(200);
      });
    })
    .catch((err) => {
      console.log(err);
      // TODO handle missing database entry
    });
};
