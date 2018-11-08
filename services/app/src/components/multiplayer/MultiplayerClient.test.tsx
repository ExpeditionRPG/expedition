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

describe('MultiplayerClient', () => {

  function fakeConnection() {
    return {
      registerEventRouter: jasmine.createSpy('registerEventRouter'),
      getClientKey: jasmine.createSpy('getClientKey'),
      sendEvent: jasmine.createSpy('sendEvent'),
      hasInFlight: jasmine.createSpy('hasInFlight'),
      getClientAndInstance: jasmine.createSpy('getClientAndInstance').and.returnValue([123,456]),
      committedEvent: jasmine.createSpy('committedEvent'),
      rejectedEvent: jasmine.createSpy('rejectedEvent'),
      publish: jasmine.createSpy('publish'),
    };
  }

  function setup(overrides: Partial<Props> = {}): Env {
    const store = newMockStore();
    const props: Props = {
      conn: fakeConnection(),
      commitID: 0,
      line: 0,
      multiplayer: initialMultiplayer,
      settings: initialSettings,
      onMultiEventStart: jasmine.createSpy('onMultiEventStart'),
      onMultiEventComplete: jasmine.createSpy('onMultiEventComplete'),
      onStatus: jasmine.createSpy('onStatus'),
      onAction: (a) => {return store.dispatch(local(a));},
      disableAudio: jasmine.createSpy('disableAudio'),
      onLoadChange: jasmine.createSpy('onLoadChange'),
      loadAudio: jasmine.createSpy('loadAudio'),
      timestamp: 0,
      ...overrides,
    };
    return {store, props, a: shallow(<MultiplayerClient {...(props as any as Props)} />, undefined)};
  }

  test.skip('periodically sends status', () => {/* TODO */});
});
