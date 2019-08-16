import Redux from 'redux';
import {handleFetchErrorsAsString} from 'shared/requests';
import {AUTH_SETTINGS} from '../Constants';
import {logEvent} from '../Logging';
import {CheckoutState, UserState} from '../reducers/StateTypes';
import {CheckoutSetStateAction} from './ActionTypes';
import {toCard} from './Card';
import {openSnackbar} from './Snackbar';

export function checkoutSetState(delta: Partial<CheckoutState>) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'CHECKOUT_SET_STATE', delta} as CheckoutSetStateAction);
  };
}

export function toCheckout(amount: number) {
  return (dispatch: Redux.Dispatch<any>): any => {
    logEvent('navigate', 'to_checkout', {value: amount});
    dispatch(toCard({name: 'CHECKOUT_ENTRY'}));
  };
}

export function checkoutSubmit(stripeToken: string, checkout: CheckoutState, user: UserState) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(checkoutSetState({processing: true}));
    fetch(AUTH_SETTINGS.URL_BASE + '/stripe/checkout', {
      body: JSON.stringify({
        amount: checkout.amount,
        productcategory: checkout.productcategory,
        productid: checkout.productid,
        token: stripeToken,
        useremail: user.email,
        userid: user.id,
      }),
      credentials: 'include',
      method: 'POST',
    })
    .then(handleFetchErrorsAsString)
    .then((response: Response) => {
      logEvent('valuable', 'checkout_success', {value: checkout.amount});
      dispatch(toCard({name: 'CHECKOUT_DONE'}));
      dispatch(checkoutSetState({processing: false}));
    })
    .catch((error: Error) => {
      console.log(error);
      logEvent('error', 'checkout_submit_err', {label: error});
      dispatch(openSnackbar(error, true));
      dispatch(toCard({name: 'CHECKOUT_ENTRY'}));
      dispatch(checkoutSetState({processing: false}));
    });
  };
}
