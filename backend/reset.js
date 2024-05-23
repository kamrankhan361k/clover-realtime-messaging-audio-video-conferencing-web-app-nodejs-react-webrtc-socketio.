require('colors');

console.log(`${'Honeyside'.yellow} © ${'2019'.yellow}`);
console.log(`Welcome to ${'Clover'.cyan}`);

const mongoose = require('mongoose');
const Room = require('./src/models/Room');
const User = require('./src/models/User');
Config = { ...require('./src/defaults'), ...require('./config') };

let dones = 0;

const done = () => {
  dones++;
  console.log('Database dropped!'.green);
  if (dones >= 2) mongoose.disconnect();
};

const mongooseConnect = () => {
  mongoose.set('useCreateIndex', true);
  let connecting = setTimeout(() => console.log('Connecting to DB...'.yellow), 1000);
  mongoose
    .connect(Config.db, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true })
    .then(() => {
      clearTimeout(connecting);
      Room.deleteMany({}).then(done);
      User.deleteMany({}).then(done);
    })
    .catch(() => {
      clearTimeout(connecting);
      console.log('Unable to connect to DB'.red);
      console.log('Retrying in 10 seconds'.yellow);
      setTimeout(mongooseConnect, 10 * 1000);
    });
};

mongooseConnect();
