import CircularProgress from '@material-ui/core/CircularProgress';
import { shallow } from 'enzyme';
import * as React from 'react';
import { initialMultiplayer } from '../../reducers/Multiplayer';
import MultiplayerSync from './MultiplayerSync';

test('shows synchronization progress and hides it once caught up', () => {
  const e = shallow(
    <MultiplayerSync
      commitID={3}
      multiplayer={{ ...initialMultiplayer, syncing: true, syncID: 10 }}
    />,
  );
  expect(e.find(CircularProgress).props()).toEqual(
    expect.objectContaining({ value: 30, variant: 'determinate' }),
  );
  e.setProps({ multiplayer: { ...initialMultiplayer, syncing: false } });
  expect(e.find(CircularProgress)).toHaveLength(0);
});
test.each([
  [0, 0, 0],
  [12, 10, 100],
  [-1, 10, 0],
])(
  'bounds progress for commit %s and target %s',
  (commitID, syncID, expected) => {
    const e = shallow(
      <MultiplayerSync
        commitID={commitID}
        multiplayer={{ ...initialMultiplayer, syncing: true, syncID }}
      />,
    );
    expect(e.find(CircularProgress).prop('value')).toBe(expected);
  },
);
