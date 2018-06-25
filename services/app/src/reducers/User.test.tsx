import {UserState} from './StateTypes';

export const testLoggedInUser: UserState = {
  loggedIn: true,
  id: '1',
  name: 'Bob Fisher',
  image: 'http://app.expeditiongame.com/logo.png',
  email: 'bob@fisher.com',
  quests: {},
};

describe('User reducer', () => {
  // Currently simple enough; no tests needed.
});
