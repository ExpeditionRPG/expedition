import * as React from 'react';
import { shallow } from 'enzyme';
import CheckoutEntry from './CheckoutEntry';
import { initialState } from '../../reducers/Checkout';
import { loggedOutUser } from 'shared/auth/UserState';
import { TUTORIAL_QUESTS } from '../../Constants';

test('mounts payment fields, validates input, submits token and displays tokenization errors', async () => {
  const card = { on: jest.fn(), mount: jest.fn(), unmount: jest.fn() };
  const stripe = {
    elements: jest.fn(() => ({ create: jest.fn(() => card) })),
    createToken: jest.fn().mockResolvedValue({ token: { id: 'test-token' } }),
  };
  const props = {
    checkout: { ...initialState, amount: 3, stripe },
    quest: { details: TUTORIAL_QUESTS[0] },
    user: loggedOutUser,
    onError: jest.fn(),
    onStripeLoad: jest.fn(),
    onSubmit: jest.fn(),
  };
  const wrapper = shallow(<CheckoutEntry {...props} />);
  expect(card.mount).toHaveBeenCalledWith('#stripeCard');
  expect(wrapper.find('#stripeSubmit').prop('disabled')).toBe(true);
  card.on.mock.calls[0][1]({ complete: true });
  wrapper.update();
  expect(wrapper.find('#stripeSubmit').prop('disabled')).toBe(false);
  const preventDefault = jest.fn();
  wrapper.find('#stripeSubmit').simulate('click', { preventDefault });
  await Promise.resolve();
  expect(preventDefault).toHaveBeenCalled();
  expect(props.onSubmit).toHaveBeenCalledWith(
    'test-token',
    props.checkout,
    props.user,
  );
  stripe.createToken.mockResolvedValueOnce({
    error: { message: 'Card declined' },
  });
  wrapper.find('#stripeSubmit').simulate('click', { preventDefault });
  await Promise.resolve();
  expect(wrapper.find('#stripeErrors').text()).toBe('Card declined');
  expect(props.onSubmit).toHaveBeenCalledTimes(1);
  wrapper.unmount();
  expect(card.unmount).toHaveBeenCalledTimes(1);
});
