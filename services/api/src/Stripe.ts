import * as Express from 'express';
import * as Joi from 'joi';
import * as Stripe from 'stripe';
import Config from './config';

// The Stripe API version this code is written against. stripe-node 22.6.1
// defaults to exactly this string, and its TypeScript types only describe this
// version -- `StripeConfig['apiVersion']` is the literal type, so the compiler
// rejects anything else. Pinning it here rather than relying on the default is
// deliberate: the account's own default API version can be changed in the
// Stripe dashboard, and an implicit version would then silently move under
// this code. Changing this string is a breaking change for the account and
// must be done together with an SDK upgrade, not on its own.
const STRIPE_API_VERSION = '2026-08-26.dahlia';

let stripe: Stripe | null = null;
if (Config.get('ENABLE_PAYMENT') && Config.get('STRIPE_PRIVATE_KEY')) {
  stripe = new Stripe(Config.get('STRIPE_PRIVATE_KEY'), {
    apiVersion: STRIPE_API_VERSION,
  });
} else {
  console.warn(
    '** Payments disabled or Stripe config not set up, any payment requests will fail. **',
  );
}

const MIN_PAYMENT_DOLLARS = 0.5; // Anything below this would be eaten by transaction fees

export function checkout(req: Express.Request, res: Express.Response) {
  const body: any = JSON.parse(req.body);
  // joi 16 removed `Joi.validate(value, schema, options, cb)`. The replacement
  // is `schema.validate(value, options)`, which is synchronous and returns
  // `{error, value}` -- `error` is `undefined` (not `null`) when valid.
  const { error, value: validBody } = Joi.object({
    amount: Joi.number().min(MIN_PAYMENT_DOLLARS),
  }).validate(body, { allowUnknown: true });

  if (error) {
    let result = 'ERROR: ';
    for (const d of error.details) {
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

  // The `stripe.charges === null` guard that used to sit here is gone: it
  // existed because @types/stripe modelled the resources as possibly absent.
  // In stripe-node's own types `charges` is a non-optional ChargeResource, so
  // the comparison no longer type-checks and could never have been true.
  //
  // stripe-node 8 dropped the node-style callback from these methods; they
  // return real promises now. The `.catch` is load-bearing -- an unhandled
  // rejection terminates the process on Node >= 15.
  return stripe.charges
    .create({
      amount: validBody.amount * 100, // charges in smallest whole units, so must convert dollars to pennies
      currency: 'usd',
      description: `Category: ${validBody.productcategory} - ID: ${validBody.productid}`,
      metadata: {
        productcategory: validBody.productcategory,
        productid: validBody.productid,
        useremail: validBody.useremail,
        userid: validBody.userid,
      },
      source: validBody.token,
    })
    .then((chargeResult: Stripe.Response<Stripe.Charge>) => {
      res.send(chargeResult);
    })
    .catch((e: Error) => {
      console.error(e);
      res.status(500).send(e.message);
    });
}
