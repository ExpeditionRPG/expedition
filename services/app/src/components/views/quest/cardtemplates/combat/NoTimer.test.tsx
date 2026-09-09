import * as React from 'react';
import { shallow } from 'enzyme';
import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import { initialSettings } from 'app/reducers/Settings';
import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { EMPTY_COMBAT_STATE } from './Types';
import NoTimer from './NoTimer';
test('shows non-timer preparation and submits a zero-time round with multiplayer context', () => {
  const props: any = {
    node: {
      ctx: { templates: { combat: { ...EMPTY_COMBAT_STATE, surgePeriod: 3 } } },
    },
    settings: { ...initialSettings, showHelp: true },
    players: 1,
    seed: 'seed',
    multiplayer: initialMultiplayer,
    onTimerStop: jest.fn(),
  };
  const e = shallow(<NoTimer {...props} />);
  expect(e.find(Card).prop('title')).toBe('Select Ability');
  expect(e.find('ol').text()).toContain('Draw three');
  e.find(Button).simulate('click');
  expect(props.onTimerStop).toHaveBeenCalledWith(
    props.node,
    props.settings,
    0,
    expect.any(Boolean),
    'seed',
    initialMultiplayer,
  );
});
