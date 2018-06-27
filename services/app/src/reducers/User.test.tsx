import {UserState} from './StateTypes';

export const testLoggedInUser: UserState = {
  email: 'bob@fisher.com',
  id: '1',
  image: 'http://app.expeditiongame.com/logo.png',
  loggedIn: true,
  name: 'Bob Fisher',
  quests: {},
};

describe('User reducer', () => {
  // Currently simple enough; no tests needed.
});
