import { loggedOutUser, user } from './User';

const signedIn = {
  displayName: 'Test User',
  email: 'test@example.com',
  id: '12345',
  image: 'http://example.com/avatar.png',
  loggedIn: true,
};

describe('user reducer', () => {
  test('returns the logged out user when given undefined', () => {
    expect(user(undefined, { type: '@@INIT' })).toEqual({
      displayName: '',
      email: '',
      id: '',
      image: '',
      loggedIn: false,
    });
  });

  test('copies the profile onto state on SET_PROFILE_META', () => {
    expect(
      user(loggedOutUser, { type: 'SET_PROFILE_META', user: signedIn } as any),
    ).toEqual(signedIn);
  });

  test('drops properties that are not part of UserState', () => {
    const result = user(loggedOutUser, {
      type: 'SET_PROFILE_META',
      user: { ...signedIn, idToken: 'secret-token', lootPoints: 10 },
    } as any);
    expect(result).toEqual(signedIn);
    expect((result as any).idToken).toBeUndefined();
  });

  test('logs the user back out when handed a logged out profile', () => {
    expect(
      user(signedIn, { type: 'SET_PROFILE_META', user: loggedOutUser } as any),
    ).toEqual(loggedOutUser);
  });

  test('does not mutate the state it was given', () => {
    const state = { ...loggedOutUser };
    const result = user(state, {
      type: 'SET_PROFILE_META',
      user: signedIn,
    } as any);
    expect(state).toEqual(loggedOutUser);
    expect(result).not.toBe(state);
  });

  test('returns the same state object for unhandled actions', () => {
    expect(user(signedIn, { type: 'SIGN_OUT' })).toBe(signedIn);
  });
});
