import { CheckoutSetStateAction } from '../actions/ActionTypes';
import { checkoutSetState } from '../actions/Checkout';
import { Reducer } from '../Testing';
import { checkout, initialState } from './Checkout';
import { CheckoutState } from './StateTypes';

// The reducer only stores the Stripe handle; a stub is enough.
const stripe = { id: 'stripe-handle' } as any;

function set(delta: Partial<CheckoutState>): CheckoutSetStateAction {
  return { type: 'CHECKOUT_SET_STATE', delta };
}

describe('Checkout reducer', () => {
  describe('initial state', () => {
    test('is returned when state is undefined', () => {
      expect(checkout(undefined, { type: '@@INIT' })).toEqual(initialState);
    });

    test('starts with nothing purchased and nothing processing', () => {
      expect(checkout(undefined, { type: '@@INIT' })).toEqual({
        amount: 0,
        processing: false,
        productcategory: '',
        productid: '',
        stripe: null,
      });
    });
  });

  describe('unknown actions', () => {
    test('returns the exact same state object', () => {
      const state: CheckoutState = { ...initialState, amount: 500 };
      expect(checkout(state, { type: 'NOT_A_CHECKOUT_ACTION' })).toBe(state);
    });
  });

  describe('CHECKOUT_SET_STATE', () => {
    test('records the product being bought', () => {
      expect(
        checkout(
          initialState,
          set({
            amount: 1000,
            productcategory: 'gift',
            productid: 'expedition-boxset',
          }),
        ),
      ).toEqual({
        amount: 1000,
        processing: false,
        productcategory: 'gift',
        productid: 'expedition-boxset',
        stripe: null,
      });
    });

    test('stores the stripe handle without disturbing the order', () => {
      const state: CheckoutState = {
        ...initialState,
        amount: 1000,
        productid: 'x',
      };
      const next = checkout(state, set({ stripe }));
      expect(next.stripe).toBe(stripe);
      expect(next.amount).toEqual(1000);
      expect(next.productid).toEqual('x');
    });

    test('moves into processing and keeps the order details', () => {
      const state: CheckoutState = {
        ...initialState,
        amount: 2500,
        productcategory: 'donation',
        productid: 'tip',
        stripe,
      };
      expect(checkout(state, set({ processing: true }))).toEqual({
        amount: 2500,
        processing: true,
        productcategory: 'donation',
        productid: 'tip',
        stripe,
      });
    });

    test('moves back out of processing after a submit resolves', () => {
      const processing = checkout(
        { ...initialState, amount: 2500 },
        set({ processing: true }),
      );
      expect(processing.processing).toEqual(true);
      const done = checkout(processing, set({ processing: false }));
      expect(done.processing).toEqual(false);
      expect(done.amount).toEqual(2500);
    });

    test('a zero amount is stored rather than ignored as falsy', () => {
      const state: CheckoutState = { ...initialState, amount: 1000 };
      expect(checkout(state, set({ amount: 0 })).amount).toEqual(0);
    });

    test('does not mutate the previous state', () => {
      const state: CheckoutState = { ...initialState, processing: false };
      const next = checkout(state, set({ processing: true }));
      expect(state.processing).toEqual(false);
      expect(next).not.toBe(state);
    });

    test('an empty delta yields an equal but fresh object', () => {
      const state: CheckoutState = { ...initialState, amount: 100 };
      const next = checkout(state, set({}));
      expect(next).toEqual(state);
      expect(next).not.toBe(state);
    });
  });

  describe('checkoutSetState() action creator', () => {
    test('dispatches a delta the reducer applies', () => {
      Reducer(checkout)
        .withState({ ...initialState, amount: 1500 })
        .expect(checkoutSetState({ processing: true }) as any)
        .toChangeState({ processing: true, amount: 1500 });
    });
  });
});
