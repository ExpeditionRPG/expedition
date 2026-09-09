import * as React from 'react';
import { shallow } from 'enzyme';
import Button from '@material-ui/core/Button';
import Splash from './Splash';
import { loggedOutUser } from '../reducers/User';

test('login button identifies its location and signed-in users see their email', () => {
  const onLogin = jest.fn();
  const wrapper = shallow(<Splash user={loggedOutUser} onLogin={onLogin} />);
  wrapper.find(Button).simulate('click');
  expect(onLogin).toHaveBeenCalledWith('appbar');
  wrapper.setProps({
    user: { ...loggedOutUser, loggedIn: true, email: 'admin@example.com' },
  });
  expect(wrapper.find(Button)).toHaveLength(0);
  expect(wrapper.find('.email').text()).toBe('admin@example.com');
});
