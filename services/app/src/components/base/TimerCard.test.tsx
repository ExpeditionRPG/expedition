import { shallow } from 'enzyme';
import * as React from 'react';
import { initialMultiplayer } from '../../reducers/Multiplayer';

import TimerCard, { Props } from './TimerCard';
describe('TimerCard', () => {
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
      a: shallow(<TimerCard {...(props as any as Props)} />, undefined),
    };
  }

  test.skip('calls onTimerStop when numLocalPlayers touch the card', () => {
    /* TODO */
  });
  test.skip('keeps going when numLocalPlayers-1 touch the card', () => {
    /* TODO */
  });
  test('waits for server when remote play and numLocalPlayers touch the card', () => {
    const { a } = setup({ multiplayerState: MP_WAIT });
    expect(a.text()).toContain('waiting on peers');
  });
});
