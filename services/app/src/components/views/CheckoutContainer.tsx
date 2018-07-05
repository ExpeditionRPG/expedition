import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard, toPrevious} from '../../actions/Card';
import {checkoutSetState, checkoutSubmit} from '../../actions/Checkout';
import {openSnackbar} from '../../actions/Snackbar';
import {logEvent} from '../../Logging';
import {AppState, CheckoutPhase, CheckoutState, UserState} from '../../reducers/StateTypes';
import Checkout, {CheckoutDispatchProps, CheckoutStateProps} from './Checkout';

const mapStateToProps = (state: AppState, ownProps: any): CheckoutStateProps => {
  return {
    card: state.card,
    checkout: state.checkout,
    quest: state.quest,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): CheckoutDispatchProps => {
  return {
    onError: (err: string): void => {
      logEvent('checkout_err', {label: err});
      dispatch(openSnackbar(Error('Error encountered: ' + err)));
    },
    onHome: (): void => {
      dispatch(toPrevious({name: 'FEATURED_QUESTS'}));
    },
    onPhaseChange: (phase: CheckoutPhase): void => {
      logEvent('checkout_phase', {label: phase});
      dispatch(toCard({name: 'CHECKOUT', phase}));
    },
    onStripeLoad: (stripe: stripe.Stripe): void => {
      dispatch(checkoutSetState({stripe}));
    },
    onSubmit: (stripeToken: string, checkout: CheckoutState, user: UserState): void => {
      dispatch(checkoutSubmit(stripeToken, checkout, user));
    },
  };
};

const CheckoutContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Checkout);

export default CheckoutContainer;
