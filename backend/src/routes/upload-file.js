const File = require('../models/File');
const mkdirp = require('mkdirp');
const fs = require('fs');
const store = require('../store');
const randomstring = require('randomstring');

module.exports = async (req, res) => {
  const file = req.files.file;
  const path = file.path;

  if (!file) {
    return res.status(500).json({ status: 500, error: 'FILE_REQUIRED' });
  }

  const shield = randomstring.generate({ length: 120, charset: 'alphanumeric', capitalization: 'lowercase' });

  let fileObject;

  fileObject = new File({
    name: file.name,
    author: req.user.id,
    size: file.size,
    file: file.type,
    shield,
  });

  await fileObject.save();

  const folder = `${store.config.dataFolder}/${req.user.id}`;

  try {
    await mkdirp(folder);
  } catch (err) {
    return res.status(500).json({ status: 500, error: 'WRITE_ERROR' });
  }

  const shieldedID = shield + file._id;

  const location = `${folder}/${shieldedID}.jpg`;

  const stream = fs.createWriteStream(location);
  const reader = fs.createReadStream(path);
  reader.pipe(stream);

  fileObject.location = location;
  fileObject.shieldedID = shieldedID;

  try {
    await fileObject.save();
  } catch (err) {
    res.status(500).json({ status: 500, error: 'DATABASE_ERROR' });
  }

  res.status(200).json({ status: 200, file: fileObject });
};
