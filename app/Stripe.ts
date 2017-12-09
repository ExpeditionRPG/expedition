import * as Express from 'express'
import Config from './config'
const Joi = require('joi');

let Stripe = require('stripe');
if (Config.get('ENABLE_PAYMENT') && Config.get('STRIPE_PRIVATE_KEY')) {
  Stripe = Stripe(Config.get('STRIPE_PRIVATE_KEY'));
} else {
  Stripe = null;
  console.warn('** Payments disabled or Stripe config not set up, any payment requests will fail. **');
}

const MIN_PAYMENT_DOLLARS = 0.5; // Anything below this would be eaten by transaction fees


export function checkout(req: Express.Request, res: Express.Response) {
  if (!Config.get('ENABLE_PAYMENT')) {
    return res.status(500).send();
  }
  const body = JSON.parse(req.body);
  Joi.validate(body, {
    amount: Joi.number().min(MIN_PAYMENT_DOLLARS),
  }, {allowUnknown: true}, (err, body) => {
    if (err) {
      return res.status(400).send(err.details.message);
    }
    const charge = Stripe.charges.create({
      amount: body.amount * 100, // charges in smallest whole units, so must convert dollars to pennies
      currency: 'usd',
      description: `Category: ${body.productcategory} - ID: ${body.productid}`,
      metadata: {
        productcategory: body.productcategory,
        productid: body.productid,
        userid: body.userid,
        useremail: body.useremail,
      },
      source: body.token,
    }, (err, charge) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error submitting payment.');
      }
      res.send(charge);
    });
  });
}
