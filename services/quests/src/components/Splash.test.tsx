import * as React from 'react';
import { shallow } from 'enzyme';
import Button from '@material-ui/core/Button';
import LoginButton from 'shared/auth/LoginButton';
import { loggedOutUser } from 'shared/auth/UserState';
import Splash from './Splash';
test('forwards announcement, login and new-quest interactions', () => {
  const props = {
    user: loggedOutUser,
    announcement: { open: true, message: 'News', link: 'https://example.com' },
    onLinkTap: jest.fn(),
    onLogin: jest.fn(),
    onNewQuest: jest.fn(),
  };
  const view = shallow(<Splash {...props} />);
  view.find(Button).filter('.announcement').simulate('click');
  expect(props.onLinkTap).toHaveBeenCalledWith('https://example.com');
  view.find(LoginButton).prop('onLogin')('token');
  expect(props.onLogin).toHaveBeenCalledWith('token');
  const user = {
    ...loggedOutUser,
    loggedIn: true,
    email: 'tester@example.com',
  };
  view.setProps({ user });
  expect(view.find(LoginButton)).toHaveLength(0);
  view
    .find(Button)
    .filterWhere(b => b.prop('children') === 'New Quest')
    .simulate('click');
  expect(props.onNewQuest).toHaveBeenCalledWith(user);
});
