import * as React from 'react';

import {CheckoutState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';

export interface StateProps extends React.Props<any> {
  checkout: CheckoutState;
}

export interface DispatchProps {
  onHome: () => void;
}

interface Props extends StateProps, DispatchProps {}

const CheckoutDone = (props: Props) => {
  return (
    <Card title="Payment Complete">
      <div className="centralMessage">
        <p>Payment for ${props.checkout.amount} complete.</p>
        <p>Thank you for your support!</p>
      </div>
      <Button onClick={() => props.onHome()}>Return Home</Button>
    </Card>
  );
};

export default CheckoutDone;
