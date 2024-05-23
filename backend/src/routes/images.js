const Images = require('../models/Image');
const fs = require('fs');

module.exports = (req, res, next) => {
  const { id, size } = req.params;

  Images.findOne({ shieldedID: id })
    .then((descriptor) => {
      if (!descriptor) return res.status(500);

      let location = descriptor.location;

      if (size) {
        location = `${location.substr(0, location.length - 4)}-${size}.jpg`;
        console.log(location);
      }

      fs.access(location, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(err);
          return res.status(404).send('Not Found');
        }

        fs.createReadStream(location).pipe(res);
        res.set('Content-type', 'image/jpeg');
        res.status(200);
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(404).send('Not Found');
    });
};
