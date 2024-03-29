import Config from './config';
const Nodemailer = require('nodemailer');

export interface MailService {
  send: (
    to: string[],
    subject: string,
    htmlMessage: string,
    sendCopy?: boolean,
    sendMail?: any,
  ) => Promise<any>;
}

let transporter: any = null;
if (Config.get('MAIL_EMAIL') && Config.get('MAIL_PASSWORD')) {
  transporter = Nodemailer.createTransport(
    'smtps://' +
      Config.get('MAIL_EMAIL') +
      ':' +
      Config.get('MAIL_PASSWORD') +
      '@smtp.gmail.com',
  );
} else {
  console.warn('Mail transport not set up; config details missing');
}
const HTML_REGEX = /<(\w|(\/\w))(.|\n)*?>/gim;

// TODO add template around message, including opt-out link
// Then, track opt-outs in DB and check against opt-out list before sending message
// Will need an opt-out route

// to: single email string, or array of emails
export function send(
  to: string[],
  subject: string,
  htmlMessage: string,
  sendCopy: boolean = true,
  isBeta: boolean = Config.get('API_URL_BASE').indexOf('beta') !== -1,
  sendMail?: any,
): Promise<any> {
  if (transporter === null) {
    return Promise.reject('mail transport not set up');
  }
  sendMail = sendMail || transporter.sendMail.bind(transporter);
  if (!sendMail) {
    return Promise.reject('transport not set up');
  }
  // for plaintext version, turn end of paragraphs into double newlines
  const mailOptions = {
    bcc: sendCopy ? 'todd@fabricate.io' : undefined,
    from: '"Expedition" <expedition@fabricate.io>', // sender address
    html: htmlMessage, // html body
    subject: isBeta ? `[BETA] ${subject}` : subject,
    text: htmlMessage.replace(/<\/p>/g, '\r\n\r\n').replace(HTML_REGEX, ''), // plaintext body
    to: to.join(','),
  };

  if (Config.get('NODE_ENV') === 'dev') {
    console.log('DEV: email not sent (mocked). Email:');
    console.log('TO: ' + mailOptions.to);
    console.log('Subject: ' + mailOptions.subject);
    console.log('Text: ' + mailOptions.html);
    return Promise.resolve({ response: '' });
  } else {
    return sendMail(mailOptions);
  }
}
