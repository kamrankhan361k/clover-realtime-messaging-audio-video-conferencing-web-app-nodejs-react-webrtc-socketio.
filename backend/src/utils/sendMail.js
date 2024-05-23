const nodemailer = require('nodemailer');
const store = require('../store');

const sendMail = (data) => {
  return new Promise((resolve, reject) => {
    const transport = nodemailer.createTransport(store.config.nodemailerTransport);

    transport.verify((error) => {
      if (error) {
        console.log('error while connecting to smtp server'.red);
        reject(error);
      } else {
        transport.sendMail(data, (err) => {
          if (err) {
            console.log(`error while sending email to ${data.to} with subject ${data.subject}`.red);
            reject(err);
          } else {
            console.log(`email sent to ${data.to} with subject ${data.subject}`.green);
            resolve();
          }
        });
      }
    });
  });
};

module.exports = sendMail;
