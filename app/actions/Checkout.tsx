import Redux from 'redux'
import {CheckoutSetStateAction} from './ActionTypes'
import {toCard} from './Card'
import {openSnackbar} from './Snackbar'
import {login} from './User'
import {handleFetchErrors} from './Web'
import {authSettings} from '../Constants'
import {logEvent} from '../Main'
import {CheckoutState, UserState} from '../reducers/StateTypes'


export function checkoutSetState(delta: any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'CHECKOUT_SET_STATE', ...delta} as CheckoutSetStateAction);
  };
}

export function toCheckout(user: UserState, amount: number) {
  return (dispatch: Redux.Dispatch<any>): any => {
    if (!user || !user.loggedIn) {
      dispatch(login({callback: (user: UserState) => {
        logEvent('to_checkout', amount);
        dispatch(toCard({name: 'CHECKOUT', phase: 'ENTRY'}));
      }}));
    } else {
      logEvent('to_checkout', amount);
      dispatch(toCard({name: 'CHECKOUT', phase: 'ENTRY'}));
    }
  }
}

export function checkoutSubmit(stripeToken: string, checkout: CheckoutState, user: UserState) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(checkoutSetState({processing: true}));
    fetch(authSettings.urlBase + '/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({
        token: stripeToken,
        amount: checkout.amount,
        productcategory: checkout.productcategory,
        productid: checkout.productid,
        userid: user.id,
        useremail: user.email,
      }),
      credentials: 'include',
    })
    .then(handleFetchErrors)
    .then((response: Response) => {
      logEvent('checkout_success', checkout.amount);
      dispatch(toCard({name: 'CHECKOUT', phase: 'DONE'}));
      dispatch(checkoutSetState({processing: false}));
    })
    .catch((error: Error) => {
      logEvent('checkout_submit_err', error);
      dispatch(openSnackbar('Error encountered: ' + error));
      dispatch(toCard({name: 'CHECKOUT', phase: 'ENTRY'}));
      dispatch(checkoutSetState({processing: false}));
    });
  }
}
