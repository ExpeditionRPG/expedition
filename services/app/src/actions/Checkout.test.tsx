import {newMockStore} from '../Testing';
import {toCheckout} from './Checkout';

describe('Checkout actions', () => {
  describe('CheckoutSetState', () => {
    // Entirely glue code; no testing needed right now.
  });

  describe('toCheckout', () => {

    /* TODO FIX
    test('Navigates to checkout if logged in', () => {
      const store = newMockStore({});
      store.dispatch(toCheckout(testLoggedInUser, 1));
      expect(store.getActions().length).toEqual(2);
      const navigateAction = store.getActions()[1];
      expect(navigateAction.type).toEqual('NAVIGATE');
      expect(navigateAction.to).toEqual(jasmine.objectContaining({name: 'CHECKOUT', phase: 'ENTRY'}));
    });
    */

    test('Navigates to login if not logged in', () => {
      const store = newMockStore({});
      store.dispatch(toCheckout(1));
      // TODO intercept the login function
    });
  });

  describe('checkoutSubmit', () => {
    test.skip('on success: notifies user and navigates to thank you page', () => { /* TODO */ });
    test.skip('on failure: notifies user and restarts checkout process', () => { /* TODO */ });
  });
});
