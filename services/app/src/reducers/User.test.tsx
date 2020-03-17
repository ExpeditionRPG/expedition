import {UserState} from './StateTypes';

export const testLoggedInUser: UserState = {
  email: 'bob@fisher.com',
  id: '1',
  image: 'http://app.expeditiongame.com/logo.png',
  loggedIn: true,
  name: 'Bob Fisher',
  lastLogin: new Date(),
  loginCount: 0,
  lootPoints: 0,
};

describe('User', () => {
  test('Empty', () => { /* Empty */ });
});
