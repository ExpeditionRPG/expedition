import Query from './query'
import Schemas from './schemas'
import Config from '../config'
import Joi from 'joi'

const Mailchimp = require('mailchimp-api-v3');

const mailchimp = (process.env.NODE_ENV !== 'dev') ? new Mailchimp(Config.get('MAILCHIMP_KEY')) : null;

const table = 'users';


export function upsert(user: any, callback: (e: Error, id: string) => any) {
  Joi.validate(user, Schemas.usersUpsert, (err: Error, user: any) => {

    if (err) {
      return callback(err, null);
    }

    Query.getId(table, 'id', (err: Error, result: any) => {

      if (err && (err as any).code !== 404) { // don't fail to upsert if the getId fails
        console.log(err);
      } else if (mailchimp) {
        mailchimp.post('/lists/' + Config.get('MAILCHIMP_CREATORS_LIST_ID') + '/members/', {
          email_address: user.email,
          status: 'subscribed',
        })
        .then((result: any) => {
          console.log(user.email + ' subscribed to creators list');
        })
        .catch((err: Error) => {
          console.log('Mailchimp error', err);
        });
      }

      Query.upsert(table, user, 'id', (err: Error, result: any) => {

        if (err) {
          return callback(err, null);
        }

        return callback(null, user.id);
      });
    });
  });
};
