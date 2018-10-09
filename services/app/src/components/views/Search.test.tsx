import {configure, render} from 'enzyme';
import * as React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import {LanguageType} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';
import {TUTORIAL_QUESTS} from '../../Constants';
import {SearchParams} from '../../reducers/StateTypes';
import {initialSettings} from '../../reducers/Settings';
import {loggedOutUser} from '../../reducers/User';
import {testLoggedInUser} from '../../reducers/User.test';
import {newMockStore} from 'app/Testing';
import {Provider} from 'react-redux';
import Search, {Props} from './Search';
configure({ adapter: new Adapter() });

const Moment = require('moment');

export const TEST_SEARCH: SearchParams = {
  age: 31536000,
  contentrating: 'Teen',
  genre: 'Comedy',
  language: 'English' as LanguageType,
  maxtimeminutes: 60,
  mintimeminutes: 30,
  order: '+title',
  text: 'Test Text',
};

describe('Search', () => {

  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      params: TEST_SEARCH
      settings: initialSettings,
      user: loggedOutUser,
      results: [],
      searching: false,
      toCard: jasmine.createSpy('toCard'),
      onReturn: jasmine.createSpy('onReturn'),
      onQuest: jasmine.createSpy('onQuest'),
      ...overrides,
    };
    const store = newMockStore({saved: {list: []}, userQuests: {history: {}}, user: loggedOutUser});
    return {props, e: render(<Provider store={store}><Search {...(props as any as Props)} /></Provider>, undefined /*renderOptions*/)};
  }

  test('renders a small selection of quests when user is not logged in', () => {
    const text = setup().e.text();
    expect(text).toContain("Sign in");
    expect(text).toContain("Oust Albanus");
  });
  test('gracefully handles no search results', () => {
    const text = setup({user: testLoggedInUser}).e.text();
    expect(text).toContain("No quests found");
  });
  test('renders some search results', () => {
    const text = setup({user: testLoggedInUser, results: TUTORIAL_QUESTS}).e.text();
    expect(text).toContain("Learning");
  });
  test('shows spinner when loading results', () => {
    const {e} = setup({user: testLoggedInUser, searching: true});
    expect(e.find('.lds-ellipsis').length).toEqual(1);
  });
});
