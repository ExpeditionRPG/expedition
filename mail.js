const Nodemailer = require('nodemailer');

const Config = require('./config');

const transporter = Nodemailer.createTransport('smtps://' + Config.get('MAIL_EMAIL') + ':' + Config.get('MAIL_PASSWORD') + '@smtp.gmail.com');

const HTML_REGEX = /<(\w|(\/\w))(.|\n)*?>/igm;

// TODO add template around message, including opt-out link
// Then, track opt-outs in DB and check against opt-out list before sending message
// Will need an opt-out route

// to: single email string, or array of emails
exports.send = function (to, subject, htmlMessage, callback) {
  // for plaintext version, turn end of paragraphs into double newlines
  const textMessage = htmlMessage.replace(/<\/p>/g, '\r\n\r\n').replace(HTML_REGEX, '');
  var mailOptions = {
    from: '"Expedition" <expedition@fabricate.io>', // sender address
    to: [].concat(to).join(','),
    bcc: 'todd@fabricate.io',
    subject: subject,
    text: textMessage, // plaintext body
    html: htmlMessage, // html body
  };
  if (process.env.NODE_ENV === 'dev') {
    console.log('DEV: email not sent (mocked). Email:');
    console.log('Subject: ' + subject);
    console.log('Text: ' + htmlMessage);
    return callback(null, {response: ''});
  } else {
    return transporter.sendMail(mailOptions, callback);
  }
};
