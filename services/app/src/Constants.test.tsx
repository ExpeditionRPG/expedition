import { multiplayerWebsocketURL, UNSUPPORTED_BROWSERS } from './Constants';

describe('Constants', () => {
  test('properly identifies unsupported browsers', () => {
    expect(UNSUPPORTED_BROWSERS.test('Amazon silk')).toEqual(true);
    expect(UNSUPPORTED_BROWSERS.test('Chrome')).toEqual(false);
  });
});

test.each([
  ['http://localhost:8086', 'ws://localhost:8086/ws/multiplayer/v1/session'],
  [
    'https://api.expeditiongame.com',
    'wss://api.expeditiongame.com/ws/multiplayer/v1/session',
  ],
  [
    'https://example.com/api/',
    'wss://example.com/api/ws/multiplayer/v1/session',
  ],
])('multiplayer socket follows API transport %s', (host, expected) => {
  expect(multiplayerWebsocketURL(host)).toBe(expected);
});
