import * as React from 'react';
import { shallow } from 'enzyme';
import LoginButton from 'shared/auth/LoginButton';
import Checkbox from '../base/Checkbox';
import SearchDisclaimer from './SearchDisclaimer';

test('passes explicit mailing-list opt-in alongside login credentials', () => {
  const onLogin = jest.fn();
  const wrapper = shallow(<SearchDisclaimer onLogin={onLogin} />);
  wrapper.find(LoginButton).prop('onLogin')('jwt-default');
  expect(onLogin).toHaveBeenLastCalledWith('jwt-default', false);
  wrapper.find(Checkbox).prop('onChange')(true);
  wrapper.find(LoginButton).prop('onLogin')('jwt-opt-in');
  expect(onLogin).toHaveBeenLastCalledWith('jwt-opt-in', true);
  wrapper.find(Checkbox).prop('onChange')(false);
  wrapper.find(LoginButton).prop('onLogin')('jwt-opt-out');
  expect(onLogin).toHaveBeenLastCalledWith('jwt-opt-out', false);
});
