import 'app/Testing';
import * as React from 'react';
import { shallow } from 'enzyme';
import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import { initialSettings } from 'app/reducers/Settings';
import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { EMPTY_COMBAT_STATE } from './Types';
import TimerCard from './TimerCard';
import BaseTimer from 'app/components/base/TimerCard';
test('shows timer with local alive count and forwards timing plus multiplayer context', () => {
  const combat = {
    ...EMPTY_COMBAT_STATE,
    surgePeriod: 3,
    enemies: [{ name: 'Skeleton', class: 'Undead', tier: 1 }],
  };
  const props: any = {
    combat,
    node: { ctx: { templates: { combat } } },
    settings: { ...initialSettings, multitouch: true, numLocalPlayers: 3 },
    multiplayerState: initialMultiplayer,
    multiplayer: initialMultiplayer,
    numAliveAdventurers: 2,
    seed: 'seed',
    onTimerStop: jest.fn(),
  };
  const e = shallow(<TimerCard {...props} />);
  expect(e.find(BaseTimer).prop('numLocalPlayers')).toBe(2);
  expect(e.find(BaseTimer).prop('icon')).toBe('undead');
  expect(e.find(BaseTimer).prop('roundTimeTotalMillis')).toBeGreaterThan(0);
  e.find(BaseTimer).prop('onTimerStop')(1234);
  expect(props.onTimerStop).toHaveBeenCalledWith(
    props.node,
    props.settings,
    1234,
    expect.any(Boolean),
    'seed',
    initialMultiplayer,
  );
});
