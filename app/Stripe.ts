import * as Express from 'express'
import Config from './config'
import * as Stripe from 'stripe'
import * as Joi from 'joi';

let stripe: Stripe|null = null;
if (Config.get('ENABLE_PAYMENT') && Config.get('STRIPE_PRIVATE_KEY')) {
  stripe = new Stripe(Config.get('STRIPE_PRIVATE_KEY'));
} else {
  console.warn('** Payments disabled or Stripe config not set up, any payment requests will fail. **');
}

const MIN_PAYMENT_DOLLARS = 0.5; // Anything below this would be eaten by transaction fees


export function checkout(req: Express.Request, res: Express.Response) {
  const body: any = JSON.parse(req.body);
  Joi.validate(body, {
    amount: Joi.number().min(MIN_PAYMENT_DOLLARS),
  }, {allowUnknown: true}, (err, validBody) => {
    if (err) {
      let result = 'ERROR: ';
      for (const d of err.details) {
        result += '\n' + d.message;
      }
      return res.status(400).send(result);
    }
    if (!validBody) {
      return res.status(400).send('No valid checkout data received');
    }
    
    if (stripe === null) {
      return res.status(500).send();
    }

    if (stripe.charges === null) {
      console.error('Stripe charges object not defined');
      return res.status(500).send('Error submitting payment');
    }

    stripe.charges.create({
      amount: validBody.amount * 100, // charges in smallest whole units, so must convert dollars to pennies
      currency: 'usd',
      description: `Category: ${validBody.productcategory} - ID: ${validBody.productid}`,
      metadata: {
        productcategory: validBody.productcategory,
        productid: validBody.productid,
        userid: validBody.userid,
        useremail: validBody.useremail,
      },
      source: validBody.token,
    }, (err: Stripe.IStripeError, chargeResult: Stripe.charges.ICharge) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error submitting payment.');
      }
      res.send(chargeResult);
    });
  });
}
