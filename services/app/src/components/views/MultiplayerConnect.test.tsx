import * as React from 'react';
import { shallow } from 'enzyme';
import { loggedOutUser } from 'shared/auth/UserState';
import { initialMultiplayer } from '../../reducers/Multiplayer';
import MultiplayerConnect from './MultiplayerConnect';
import Button from '../base/Button';

test('creates, joins and reconnects with the selected user and historical session', () => {
  const user = { ...loggedOutUser, loggedIn: true };
  const props = {
    user,
    multiplayer: {
      ...initialMultiplayer,
      history: [
        {
          id: 'session-1',
          secret: 'ABCD',
          questTitle: 'Adventure',
          peerCount: 2,
          lastAction: Date.now(),
        },
      ],
    },
    onConnect: jest.fn(),
    onReconnect: jest.fn(),
    onNewSessionRequest: jest.fn(),
  };
  const wrapper = shallow(<MultiplayerConnect {...props} />);
  wrapper.find(Button).at(0).simulate('click');
  expect(props.onNewSessionRequest).toHaveBeenCalledWith(user);
  wrapper.find(Button).at(1).simulate('click');
  expect(props.onConnect).toHaveBeenCalledWith(user);
  wrapper.find(Button).at(2).simulate('click');
  expect(props.onReconnect).toHaveBeenCalledWith(user, 'session-1', 'ABCD');
  expect(
    wrapper
      .find(Button)
      .at(2)
      .children()
      .map(child => child.text())
      .join(''),
  ).toContain('Adventure (2 peers)');
  wrapper.setProps({ multiplayer: initialMultiplayer });
  expect(wrapper.find(Button)).toHaveLength(2);
});
