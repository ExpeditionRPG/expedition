const Nodemailer = require('nodemailer');

import Config from './config'

const transporter = Nodemailer.createTransport('smtps://' + Config.get('MAIL_EMAIL') + ':' + Config.get('MAIL_PASSWORD') + '@smtp.gmail.com');

const HTML_REGEX = /<(\w|(\/\w))(.|\n)*?>/igm;

// TODO add template around message, including opt-out link
// Then, track opt-outs in DB and check against opt-out list before sending message
// Will need an opt-out route

// to: single email string, or array of emails
export function send(to: string|string[], subject: string, htmlMessage: string, callback: (e: Error, r: any)=>any) {
  // for plaintext version, turn end of paragraphs into double newlines
  var mailOptions = {
    from: '"Expedition" <expedition@fabricate.io>', // sender address
    to: [].concat(to).join(','),
    bcc: 'todd@fabricate.io',
    subject: subject,
    text: htmlMessage.replace(/<\/p>/g, '\r\n\r\n').replace(HTML_REGEX, ''), // plaintext body
    html: htmlMessage, // html body
  };
  if (Config.get('NODE_ENV') === 'dev') {
    console.log('DEV: email not sent (mocked). Email:');
    console.log('TO: '+ mailOptions.to);
    console.log('Subject: ' + subject);
    console.log('Text: ' + htmlMessage);
    return callback(null, {response: ''});
  } else {
    return transporter.sendMail(mailOptions, callback);
  }
}
