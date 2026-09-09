import { loggedOutUser } from 'shared/auth/UserState';
import { user } from './User';
test('initializes logged out and replaces profile metadata immutably', () => {
  expect(user(undefined, { type: 'INIT' })).toEqual(loggedOutUser);
  const profile = { ...loggedOutUser, name: 'Tester', loggedIn: true };
  const next = user(undefined, {
    type: 'SET_PROFILE_META',
    user: profile,
  } as any);
  expect(next).toEqual(profile);
  expect(next).not.toBe(profile);
  expect(user(next, { type: 'UNKNOWN' })).toBe(next);
});
