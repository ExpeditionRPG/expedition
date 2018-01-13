import Redux from 'redux'
import {CheckoutSetStateAction} from '../actions/ActionTypes'
import {CheckoutState} from './StateTypes'

export const initialState: CheckoutState = {
  amount: 0,
  processing: false,
  productcategory: '',
  productid: '',
  stripe: null,
};

export function checkout(state: CheckoutState = initialState, action: Redux.Action): CheckoutState {
  switch (action.type) {
    case 'CHECKOUT_SET_STATE':
      return {...state, ...(action as any)};
    default:
      return state;
  }
}
