import {connect} from 'react-redux';
import Redux from 'redux';
import {checkoutSetState, checkoutSubmit} from '../../actions/Checkout';
import {openSnackbar} from '../../actions/Snackbar';
import {logEvent} from '../../Logging';
import {AppState, CheckoutState, UserState} from '../../reducers/StateTypes';
import CheckoutEntry, {DispatchProps, StateProps} from './CheckoutEntry';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    checkout: state.checkout,
    quest: state.quest,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onError: (err: string): void => {
      logEvent('error', 'checkout_err', {label: err});
      dispatch(openSnackbar(Error('Error encountered: ' + err)));
    },
    onStripeLoad: (stripe: stripe.Stripe): void => {
      dispatch(checkoutSetState({stripe}));
    },
    onSubmit: (stripeToken: string, checkout: CheckoutState, user: UserState): void => {
      dispatch(checkoutSubmit(stripeToken, checkout, user));
    },
  };
};

const CheckoutEntryContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckoutEntry);

export default CheckoutEntryContainer;
