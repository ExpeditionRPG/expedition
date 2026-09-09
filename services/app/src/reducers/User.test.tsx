import { user } from './User';
import { loggedOutUser } from 'shared/auth/UserState';
import { UserState } from './StateTypes';

export const testLoggedInUser: UserState = {
  email: 'bob@fisher.com',
  id: '1',
  image: 'http://app.expeditiongame.com/logo.png',
  loggedIn: true,
  name: 'Bob Fisher',
};

describe('User', () => {
  test('updates login, feedback, and badges while preserving profile fields', () => {
    expect(user(undefined, { type: '@@INIT' })).toEqual(loggedOutUser);
    const loggedIn = user(undefined, {
      type: 'USER_LOGIN',
      user: testLoggedInUser,
    } as any);
    expect(loggedIn).toBe(testLoggedInUser);
    const feedbacks = [{ id: 1 }];
    const withFeedback = user(loggedIn, {
      type: 'USER_FEEDBACKS',
      feedbacks,
    } as any);
    const withBadges = user(withFeedback, {
      type: 'USER_BADGES',
      badges: ['author'],
    } as any);
    expect(withBadges).toEqual({
      ...testLoggedInUser,
      feedbacks,
      badges: ['author'],
    });
    expect(user(withBadges, { type: 'UNKNOWN' })).toBe(withBadges);
  });
});
