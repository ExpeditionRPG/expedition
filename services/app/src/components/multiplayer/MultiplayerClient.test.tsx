import {newMockStore} from '../../Testing';
import {remoteify, clearMultiplayerActions} from '../../multiplayer/Remoteify';
import {configure, shallow} from 'enzyme';
import * as React from 'react';
import MultiplayerClient, {Props} from './MultiplayerClient';
import {initialMultiplayer} from '../../reducers/Multiplayer';
import {local} from '../../actions/Multiplayer';
import Adapter from 'enzyme-adapter-react-16';
import {initialSettings} from '../../reducers/Settings';
configure({ adapter: new Adapter() });

jest.useFakeTimers();

describe('MultiplayerClient', () => {

  function setup(overrides: Partial<Props> = {}): Env {
    const store = newMockStore();
    const props: Props = {
      commitID: 0,
      multiplayer: {...initialMultiplayer, connected: true},
      onStatus: jasmine.createSpy('onStatus'),
      onEvent: jasmine.createSpy('onEvent'),
      onReject: jasmine.createSpy('onReject'),
      onConnectionChange: jasmine.createSpy('onConnectionChange'),
      onRegisterHandler: jasmine.createSpy('onRegisterHandler'),
      ...overrides,
    };
    return {store, props, a: shallow(<MultiplayerClient {...(props as any as Props)} />, undefined)};
  }

  test('periodically sends status', () => {
    const {a, props} = setup();
    jest.runOnlyPendingTimers();
    expect(props.onStatus).toHaveBeenCalled();
  });
});
