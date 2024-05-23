const Image = require('../models/Image');
const mkdirp = require('mkdirp');
const sharp = require('sharp');
const store = require('../store');
const randomstring = require('randomstring');

module.exports = async (req, res) => {
  const image = req.files.image;
  const { crop } = req.fields;
  const path = image.path;

  if (!image) {
    return res.status(500).json({ status: 500, error: 'FILE_REQUIRED' });
  }

  const shield = randomstring.generate({ length: 120, charset: 'alphanumeric', capitalization: 'lowercase' });

  let imageObject;

  imageObject = new Image({
    name: image.name,
    author: req.user.id,
    size: image.size,
    shield,
  });

  await imageObject.save();

  const folder = `${store.config.dataFolder}/${req.user.id}`;

  try {
    await mkdirp(folder);
  } catch (err) {
    return res.status(500).json({ status: 500, error: 'WRITE_ERROR' });
  }

  const shieldedID = shield + imageObject._id;

  const location = `${folder}/${shieldedID}.jpg`;

  await sharp(path).rotate().toFile(location);

  for (let i = 0; i < store.config.sizes.length; i++) {
    const location = `${folder}/${shieldedID}-${store.config.sizes[i]}.jpg`;

    let size = {};

    if (crop === 'square') size = { width: store.config.sizes[i], height: store.config.sizes[i] };
    else size = { width: store.config.sizes[i] };

    await sharp(path).rotate().resize(size).toFile(location);
  }

  imageObject.location = location;
  imageObject.shieldedID = shieldedID;

  try {
    await imageObject.save();
  } catch (err) {
    res.status(500).json({ status: 500, error: 'DATABASE_ERROR' });
  }

  res.status(200).json({ status: 200, image: imageObject });
};
