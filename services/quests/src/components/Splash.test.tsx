import * as React from 'react';
import { shallow } from 'enzyme';
import Button from '@material-ui/core/Button';
import LoginButton from 'shared/auth/LoginButton';
import { loggedOutUser } from 'shared/auth/UserState';
import Splash from './Splash';
test('sign-in exposes a separate create action without requesting Drive automatically', async () => {
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
  expect(props.onNewQuest).not.toHaveBeenCalled();
  expect(view.find('[role="status"]').text()).toBe('Signing in…');
  for (let i = 0; i < 5; i++) await Promise.resolve();
  const user = {
    ...loggedOutUser,
    loggedIn: true,
    email: 'tester@example.com',
  };
  view.setProps({ user });
  expect(view.find(LoginButton)).toHaveLength(0);
  view
    .find(Button)
    .filterWhere(b => b.prop('children') === 'Create a quest')
    .simulate('click');
  expect(props.onNewQuest).toHaveBeenCalledWith(user);
  for (let i = 0; i < 5; i++) await Promise.resolve();
});

test('failed authorization shows a recoverable error and allows another click', async () => {
  const onNewQuest = jest
    .fn()
    .mockRejectedValueOnce(
      new Error('Google authorization was closed. Please try again.'),
    )
    .mockResolvedValueOnce(undefined);
  const view = shallow(
    <Splash
      user={{ ...loggedOutUser, loggedIn: true }}
      announcement={{ open: false, message: '', link: '' }}
      onLinkTap={jest.fn()}
      onLogin={jest.fn()}
      onNewQuest={onNewQuest}
    />,
  );
  const button = () =>
    view.find(Button).filterWhere(b => b.prop('children') === 'Create a quest');
  button().simulate('click');
  expect(button().prop('disabled')).toBe(true);
  expect(view.find('[role="status"]').text()).toBe('Connecting Google Drive…');
  for (let i = 0; i < 5; i++) await Promise.resolve();
  view.update();
  expect(view.find('[role="alert"]').text()).toContain(
    'authorization was closed',
  );
  expect(button().prop('disabled')).toBe(false);
  button().simulate('click');
  expect(onNewQuest).toHaveBeenCalledTimes(2);
  for (let i = 0; i < 5; i++) await Promise.resolve();
});

test('a pending quest has separate open and create actions invoked directly by a click', async () => {
  const user = { ...loggedOutUser, loggedIn: true };
  const onOpenQuest = jest.fn().mockResolvedValue(undefined);
  const onNewQuest = jest.fn().mockResolvedValue(undefined);
  const view = shallow(
    <Splash
      user={user}
      pendingQuestId="quest-123"
      announcement={{ open: false, message: '', link: '' }}
      onLinkTap={jest.fn()}
      onLogin={jest.fn()}
      onOpenQuest={onOpenQuest}
      onNewQuest={onNewQuest}
    />,
  );
  view
    .find(Button)
    .filterWhere(b => b.prop('children') === 'Open your quest')
    .simulate('click');
  expect(onOpenQuest).toHaveBeenCalledWith(user, 'quest-123');
  expect(onNewQuest).not.toHaveBeenCalled();
  expect(view.find(Button).everyWhere(b => b.prop('disabled') === true)).toBe(
    true,
  );
  // Even a second callback during the pending operation cannot open another popup.
  view
    .find(Button)
    .filterWhere(b => b.prop('children') === 'Create a new quest')
    .simulate('click');
  expect(onNewQuest).not.toHaveBeenCalled();
  for (let i = 0; i < 5; i++) await Promise.resolve();
  view
    .find(Button)
    .filterWhere(b => b.prop('children') === 'Create a new quest')
    .simulate('click');
  expect(onNewQuest).toHaveBeenCalledWith(user);
  for (let i = 0; i < 5; i++) await Promise.resolve();
});

test('a failed sign-in leaves the single login entry available for retry', async () => {
  const onLogin = jest
    .fn()
    .mockRejectedValueOnce(new Error('Sign-in failed'))
    .mockResolvedValue(undefined);
  const view = shallow(
    <Splash
      user={loggedOutUser}
      pendingQuestId="quest-123"
      announcement={{ open: false, message: '', link: '' }}
      onLinkTap={jest.fn()}
      onLogin={onLogin}
      onNewQuest={jest.fn()}
    />,
  );
  expect(view.find(LoginButton)).toHaveLength(1);
  expect(view.text()).toContain('open your quest or start a new one');
  view.find(LoginButton).prop('onLogin')('first-token');
  expect(view.find('fieldset').prop('disabled')).toBe(true);
  for (let i = 0; i < 5; i++) await Promise.resolve();
  expect(view.find('[role="alert"]').text()).toBe('Sign-in failed');
  expect(view.find('fieldset').prop('disabled')).toBe(false);
  view.find(LoginButton).prop('onLogin')('retry-token');
  expect(onLogin).toHaveBeenLastCalledWith('retry-token');
  expect(view.find('[role="alert"]')).toHaveLength(0);
  for (let i = 0; i < 5; i++) await Promise.resolve();
});
