import { shallow } from 'enzyme';
import * as React from 'react';
import { initialMultiplayer } from '../../reducers/Multiplayer';

import TimerCard from './TimerCard';
import MultiTouchTrigger from './MultiTouchTrigger';
type Props = React.ComponentProps<typeof TimerCard>;
describe('TimerCard', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  const MP_WAIT = {
    ...initialMultiplayer,
    clientStatus: {
      'abc|def': { connected: true, waitingOn: { type: 'TIMER' } },
      'asdf|ghjk': { connected: true, waitingOn: null },
    },
    client: 'abc',
    instance: 'def',
  };

  function setup(overrides: Partial<Props> = {}): Env {
    const props: Props = {
      numLocalPlayers: 3,
      secondaryText: 'secondary text',
      tertiaryText: 'tertiary text',
      icon: '',
      roundTimeTotalMillis: 10000,
      theme: 'light',
      multiplayerState: initialMultiplayer,
      onTimerStop: jest.fn(),
      ...overrides,
    };
    return {
      a: shallow(<TimerCard {...props} />, undefined),
    };
  }

  test('calls onTimerStop when numLocalPlayers touch the card', () => {
    const onTimerStop = jest.fn();
    const { a } = setup({ onTimerStop });
    jest.advanceTimersByTime(1250);
    a.find(MultiTouchTrigger).prop('onTouchChange')(3);
    expect(onTimerStop).toHaveBeenCalledWith(1250);
    a.find(MultiTouchTrigger).prop('onTouchChange')(3);
    expect(onTimerStop).toHaveBeenCalledTimes(1);
    a.unmount();
  });
  test('keeps going when numLocalPlayers-1 touch the card', () => {
    const onTimerStop = jest.fn();
    const { a } = setup({ onTimerStop });
    a.find(MultiTouchTrigger).prop('onTouchChange')(2);
    jest.advanceTimersByTime(1000);
    expect(onTimerStop).not.toHaveBeenCalled();
    expect(a.find('.value').text()).toBe('9.0s');
    a.unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
  test('waits for server when remote play and numLocalPlayers touch the card', () => {
    const { a } = setup({ multiplayerState: MP_WAIT });
    expect(a.text()).toContain('waiting on peers');
  });
});
