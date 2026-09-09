import * as React from 'react';
import { shallow } from 'enzyme';
import CheckoutDone from './CheckoutDone';
import Button from '../base/Button';
import { initialState } from '../../reducers/Checkout';

test('confirms the paid amount and returns home on request', () => {
  const onHome = jest.fn();
  const wrapper = shallow(
    <CheckoutDone checkout={{ ...initialState, amount: 5 }} onHome={onHome} />,
  );
  expect(wrapper.find('.centralMessage').text()).toContain(
    'Payment for $5 complete.',
  );
  wrapper.find(Button).simulate('click');
  expect(onHome).toHaveBeenCalledTimes(1);
});
