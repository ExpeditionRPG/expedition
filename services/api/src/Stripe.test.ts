import { mockReq, mockRes } from 'sinon-express-mock';
jest.mock('stripe', () => jest.fn());
function checkout(enabled: boolean, create = jest.fn()) {
  jest.resetModules();
  jest.doMock('./config', () => ({
    default: {
      get: (key: string) =>
        ({ ENABLE_PAYMENT: enabled, STRIPE_PRIVATE_KEY: 'sk_test_local' })[key],
    },
  }));
  require('stripe').mockImplementation(() => ({ charges: { create } }));
  return require('./Stripe').checkout;
}
describe('Stripe checkout', () => {
  test('returns error if payments are disabled', () => {
    const res = mockRes();
    checkout(false)(mockReq({ body: '{"amount":1}' }), res);
    expect(res.status.calledWith(500)).toBe(true);
  });
  test('rejects amounts below 50 cents', () => {
    const create = jest.fn();
    const res = mockRes();
    checkout(true, create)(mockReq({ body: '{"amount":0.49}' }), res);
    expect(res.status.calledWith(400)).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });
  test('returns error if the Stripe API rejects the charge', async () => {
    const create = jest.fn().mockRejectedValue(new Error('card declined'));
    const res = mockRes();
    await checkout(true, create)(
      mockReq({ body: '{"amount":2,"token":"tok_test"}' }),
      res,
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 200,
        currency: 'usd',
        source: 'tok_test',
      }),
    );
    expect(res.status.calledWith(500)).toBe(true);
    expect(res.send.calledWith('card declined')).toBe(true);
  });
});
