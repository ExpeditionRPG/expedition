import { mapDispatchToProps } from './CheckoutEntryContainer';
import { newMockStoreWithInitializedState } from '../../Testing';
import { initialState } from '../../reducers/Checkout';
import { loggedOutUser } from 'shared/auth/UserState';
import { AUTH_SETTINGS } from '../../Constants';
const fetchMock = require('fetch-mock');
afterEach(() => fetchMock.restore());

test('errors expose a reportable snackbar', () => {
  const store = newMockStoreWithInitializedState();
  mapDispatchToProps(store.dispatch).onError('token failure');
  expect(store.getActions()).toContainEqual(
    expect.objectContaining({ type: 'SNACKBAR_OPEN', actionLabel: 'Report' }),
  );
});
test.each([200, 500])(
  'submits through real checkout thunk and handles HTTP %s',
  async status => {
    const url = AUTH_SETTINGS.URL_BASE + '/stripe/checkout';
    fetchMock.post(url, {
      status,
      body: status === 200 ? 'OK' : 'Payment declined',
    });
    const store = newMockStoreWithInitializedState();
    const checkout = {
      ...initialState,
      amount: 3,
      productid: 'quest-1',
      productcategory: 'Quest Tip',
    };
    const user = {
      ...loggedOutUser,
      id: 'user-1',
      email: 'user@example.com',
      loggedIn: true,
    };
    await mapDispatchToProps(store.dispatch).onSubmit(
      'test-token',
      checkout,
      user,
    );
    expect(JSON.parse(fetchMock.lastOptions(url).body)).toMatchObject({
      token: 'test-token',
      amount: 3,
      productid: 'quest-1',
      userid: 'user-1',
    });
    expect(store.getActions()).toContainEqual({
      type: 'CHECKOUT_SET_STATE',
      delta: { processing: false },
    });
    expect(store.getActions()).toContainEqual(
      expect.objectContaining({
        type: 'NAVIGATE',
        to: expect.objectContaining({
          name: status === 200 ? 'CHECKOUT_DONE' : 'CHECKOUT_ENTRY',
        }),
      }),
    );
    const errors = store
      .getActions()
      .filter(action => action.type === 'SNACKBAR_OPEN');
    expect(errors).toHaveLength(status === 200 ? 0 : 1);
    if (status !== 200) expect(errors[0].message).toBe('Payment declined');
  },
);
