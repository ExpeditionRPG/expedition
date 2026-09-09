import { newMockStore } from '../Testing';
import { checkoutSetState, checkoutSubmit, toCheckout } from './Checkout';

const fetchMock = require('fetch-mock');
afterEach(() => fetchMock.restore());

test('updates checkout state', () => {
  const store = newMockStore({});
  store.dispatch(checkoutSetState({ amount: 500 }));
  expect(store.getActions()).toEqual([
    { type: 'CHECKOUT_SET_STATE', delta: { amount: 500 } },
  ]);
});
// Authentication is owned by shared auth; this action now always opens checkout.
test('navigates to checkout entry', () => {
  const store = newMockStore({});
  store.dispatch(toCheckout(500));
  expect(store.getActions()).toContainEqual(
    expect.objectContaining({
      type: 'NAVIGATE',
      to: expect.objectContaining({ name: 'CHECKOUT_ENTRY' }),
    }),
  );
});
test.each([200, 500])('completes checkout with HTTP %s', async status => {
  fetchMock.post('end:/stripe/checkout', { status, body: 'response' });
  const store = newMockStore({});
  await store.dispatch(
    checkoutSubmit(
      'token',
      { amount: 500, productid: 'quest', productcategory: 'donation' } as any,
      { id: 'user', email: 'test@example.com' } as any,
    ),
  );
  const actions = store.getActions();
  expect(actions[0]).toEqual({
    type: 'CHECKOUT_SET_STATE',
    delta: { processing: true },
  });
  expect(actions).toContainEqual(
    expect.objectContaining({
      type: 'NAVIGATE',
      to: expect.objectContaining({
        name: status === 200 ? 'CHECKOUT_DONE' : 'CHECKOUT_ENTRY',
      }),
    }),
  );
  expect(actions[actions.length - 1]).toEqual({
    type: 'CHECKOUT_SET_STATE',
    delta: { processing: false },
  });
  expect(actions.some(action => action.type === 'SNACKBAR_OPEN')).toBe(
    status !== 200,
  );
  const options = fetchMock.lastOptions();
  expect(options.credentials).toBe('include');
  expect(JSON.parse(options.body)).toEqual({
    amount: 500,
    productid: 'quest',
    productcategory: 'donation',
    token: 'token',
    userid: 'user',
    useremail: 'test@example.com',
  });
});
