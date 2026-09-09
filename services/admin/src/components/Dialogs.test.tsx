import * as React from 'react';
import { shallow } from 'enzyme';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { UserDetailsDialog } from './Dialogs';

test('user details can set loot points to zero and ignore empty input', () => {
  const user = {
    id: 'user-1',
    name: 'Player',
    email: 'player@example.com',
    loot_points: 10,
    last_login: new Date('2026-01-01'),
  };
  const onSetUserLootPoints = jest.fn();
  const wrapper = shallow(
    <UserDetailsDialog
      open={true}
      user={user}
      onClose={jest.fn()}
      onSetUserLootPoints={onSetUserLootPoints}
    />,
  );
  wrapper.find(TextField).simulate('change', { target: { value: '0' } });
  expect(wrapper.find(TextField).prop('value')).toBe(0);
  wrapper.find(Button).at(0).simulate('click');
  expect(onSetUserLootPoints).toHaveBeenCalledWith(user, 0);
  wrapper.find(TextField).simulate('change', { target: { value: '' } });
  wrapper.find(Button).at(0).simulate('click');
  expect(onSetUserLootPoints).toHaveBeenCalledTimes(1);
});
