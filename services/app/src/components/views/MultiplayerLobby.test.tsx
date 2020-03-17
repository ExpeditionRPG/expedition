import {mount, unmountAll} from 'app/Testing';
import MultiplayerLobby, { Props } from './MultiplayerLobby';
import {initialSettings} from '../../reducers/Settings';
import {initialMultiplayer} from '../../reducers/Multiplayer';
import {loggedOutUser} from 'shared/auth/UserState';
import {Expansion} from 'shared/schema/Constants';

describe('Multiplayer lobby', () => {
  afterEach(unmountAll);

  function setup(overrides?: Props) {
    const props: Props = {
      phase: 'LOBBY',
      user: loggedOutUser,
      settings: initialSettings,
      multiplayer: initialMultiplayer,
      contentSets: new Set(),
      onConnect: jasmine.createSpy('onConnect'),
      onReconnect: jasmine.createSpy('onReconnect'),
      onNewSessionRequest: jasmine.createSpy('onNewSessionRequest'),
      onStart: jasmine.createSpy('onStart'),
      onPlayerChange: jasmine.createSpy('onPlayerChange'),
      ...overrides,
    } as any;
    const elem = mount(MultiplayerLobby(props));
    return {elem, props};
  }

  test('shows connection secret', () => {
    const {elem} = setup({
      multiplayer: {
        ...initialMultiplayer,
        session: {secret: 'asdf'},
      },
    } as any);
    expect(elem.find('.sessionCode').text()).toEqual('asdf');
  });
  test('shows content set intersection', () => {
    const {elem} = setup({
      multiplayer: {
        ...initialMultiplayer,
        connected: true,
        session: {id: 'abc', secret: 'def'},
      },
      contentSets: new Set([Expansion.horror]),
    } as any);
    const result = elem.find('#contentsets').text();
    expect(result).toContain('The Horror');
    expect(result).not.toContain('The Future');
  });
  test('calls onStart when start button clicked', () => {
    const {elem, props} = setup();
    (elem.find('ExpeditionButton#start').prop('onClick') as any)();
    expect(props.onStart).toHaveBeenCalled();
  });
  test('disables onStart when too many players', () => {
    const {elem} = setup({settings: {...initialSettings, numLocalPlayers: 7}} as any);
    expect(elem.find('ExpeditionButton#start').prop('disabled')).toEqual(true);
  });
});
