import {toCheckout} from './Checkout'
import {newMockStore} from '../Testing'

describe('Checkout actions', () => {
  describe('CheckoutSetState', () => {
    // Entirely glue code; no testing needed right now.
  });

  describe('toCheckout', () => {

    /* TODO FIX
    it('Navigates to checkout if logged in', () => {
      const store = newMockStore({});
      store.dispatch(toCheckout(testLoggedInUser, 1));
      expect(store.getActions().length).toEqual(2);
      const navigateAction = store.getActions()[1];
      expect(navigateAction.type).toEqual('NAVIGATE');
      expect(navigateAction.to).toEqual(jasmine.objectContaining({name: 'CHECKOUT', phase: 'ENTRY'}));
    });
    */

    it('Navigates to login if not logged in', () => {
      const store = newMockStore({});
      store.dispatch(toCheckout(1));
      // TODO intercept the login function
    });
  });

  describe('checkoutSubmit', () => {
    it('on success: notifies user and navigates to thank you page');
    it('on failure: notifies user and restarts checkout process');
  });
});
