import {mount} from 'app/Testing';
import * as React from 'react';

import { IUserFeedback, UserState } from '../../reducers/StateTypes';
import Account, { IProps } from './Account';

describe('Account', () => {

  const initialUser: UserState = {
    loggedIn: true,
    id: '1',
    name: 'nimish',
    email: 'nimish@pesto.tech',
    lastLogin: null as any,
    loginCount: 1,
    lootPoints: 12,
  } as any;

  const feedback: IUserFeedback = {
    rating: 1,
    text: 'Quest is good',
    quest: {
      lastPlayed: new Date(),
      details: { id: '2' } as any,
    },
  };

  function createElement(user = {}) {
    const props: IProps = {
      user: {...initialUser, ...user },
      getUserFeedBacks: jest.fn(),
      getUserBadges: jest.fn(),
      onReturn: jest.fn(),
      onQuestSelect: jest.fn(),
    };
    const elem = mount(<Account {...props} />);
    return {elem, props};
  }

  test('show loading when not all data is received', () => {
    const {elem} = createElement();
    expect(elem.find('div.lds-ellipsis').length).toBe(1);
  });

  test('when user has given feedback to some quests', () => {
    const {elem} = createElement({ feedbacks: [feedback], badges: [] });
    expect(elem.find('div.details.ratingavg').length).toBe(1);
  });

  test('show badges', () => {
    const {elem} = createElement({ feedbacks: [], badges: ['backer1'] });
    const badges = elem.find('table.detailsTable img');
    expect(badges.length).toEqual(1);
    expect(badges.html()).toContain('backer1');
  });
});
