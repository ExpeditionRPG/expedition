import * as React from 'react'
import LockIcon from 'material-ui/svg-icons/action/lock'

import Button from './base/Button'
import Card from './base/Card'
import {authSettings} from '../Constants'
import {CardState, CheckoutState, QuestState, UserState} from '../reducers/StateTypes'

declare var Stripe: any;


export interface CheckoutStateProps extends React.Props<any> {
  card: CardState,
  checkout: CheckoutState,
  quest: QuestState,
  user: UserState,
}

export interface CheckoutDispatchProps {
  onError: (error: string) => void;
  onHome: () => void;
  onPhaseChange: (phase: string) => void;
  onStripeLoad: (stripe: any) => void;
  onSubmit: (stripeToken: string, checkout: CheckoutState, user: UserState) => void;
}

export interface CheckoutProps extends CheckoutStateProps, CheckoutDispatchProps {}

// Docs: https://stripe.com/docs/stripe-js
export default class Checkout extends React.Component<CheckoutProps, {}> {
  state: { card: any, paymentError: string, paymentValid: boolean };

  constructor(props: CheckoutProps) {
    super(props);
    this.state = { card: null, paymentError: null, paymentValid: false };
  }

  componentDidMount() {
    if (this.state.card) { return; }
    let stripe = this.props.checkout.stripe;
    if (!stripe) {
      stripe = Stripe(authSettings.stripe);
      this.props.onStripeLoad(stripe);
    }
    const elements = stripe.elements();
    const card = elements.create('card', {
      style: {
        base: {
          fontSize: '18px',
          fontFamily: 'MinionPro, serif',
        },
      },
    });
    card.mount('#stripeCard');
    this.setState({card});

    card.on('change', (response: any) => {
      this.setState({
        paymentError: (response.error) ? response.error.message : null,
        paymentValid: response.complete,
      });
    });
  }

  componentWillUnmount() {
    this.state.card.unmount();
  }

  handleSubmit(event: any) {
    this.props.checkout.stripe.createToken(this.state.card).then((result: any) => {
      if (result.error) {
        this.setState({paymentError: result.error.message});
      } else {
        this.props.onSubmit(result.token.id, this.props.checkout, this.props.user);
      }
    });
    event.preventDefault();
  }

  render() {
    switch (this.props.card.phase) {
      case 'ENTRY':
        return (
          <Card title="Tip the Author">
            <div id="stripe">
              <form id="stripeForm" action="/charge" method="post" className={this.props.checkout.processing && 'disabled'}>
                <div className="form-row">
                  <p>Please enter your credit or debit card to tip {this.props.quest.details.author} ${this.props.checkout.amount} for <i>{this.props.quest.details.author}</i>.</p>
                  <label className="security"><LockIcon />Payments processed securely by Stripe.</label>
                  <div id="stripeCard"></div>
                  <div id="stripeErrors" role="alert">{this.state.paymentError}</div>
                </div>
                {!this.props.checkout.processing && <Button id="stripeSubmit" disabled={!this.state.paymentValid} onTouchTap={(e: any) => this.handleSubmit(e)}>
                  {(this.state.paymentValid) ? 'Pay' : 'Enter payment info'}
                </Button>}
                {this.props.checkout.processing && <div className="centralMessage">Processing payment, one moment...</div>}
              </form>
            </div>
          </Card>
        );
      case 'DONE':
        return (
          <Card title="Payment Complete">
            <div className="centralMessage">
              <p>Payment for ${this.props.checkout.amount} complete.</p>
              <p>Thank you for your support!</p>
            </div>
            <Button onTouchTap={() => this.props.onHome()}>Return Home</Button>
          </Card>
        );
      default:
        return null;
    }
  }
}
