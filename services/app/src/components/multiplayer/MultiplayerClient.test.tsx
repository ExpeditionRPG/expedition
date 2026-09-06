import { shallow } from 'enzyme';
import * as React from 'react';
import { local } from '../../actions/Multiplayer';
import {
  clearMultiplayerActions,
  remoteify,
} from '../../multiplayer/Remoteify';
import { initialMultiplayer } from '../../reducers/Multiplayer';
import { initialSettings } from '../../reducers/Settings';

import { newMockStore } from '../../Testing';
import MultiplayerClient, { Props } from './MultiplayerClient';
jest.useFakeTimers();

describe('MultiplayerClient', () => {
  function setup(overrides: Partial<Props> = {}): Env {
    const store = newMockStore();
    const props: Props = {
      commitID: 0,
      multiplayer: { ...initialMultiplayer, connected: true },
      onStatus: jest.fn(),
      onEvent: jest.fn(),
      onReject: jest.fn(),
      onConnectionChange: jest.fn(),
      onRegisterHandler: jest.fn(),
      ...overrides,
    };
    return {
      store,
      props,
      a: shallow(
        <MultiplayerClient {...((props as any) as Props)} />,
        undefined,
      ),
    };
  }

  test('periodically sends status', () => {
    const { a, props } = setup();
    jest.runOnlyPendingTimers();
    expect(props.onStatus).toHaveBeenCalled();
  });
});
