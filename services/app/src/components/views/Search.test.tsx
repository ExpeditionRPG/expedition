import * as React from 'react';
import {LanguageType} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';
import {TUTORIAL_QUESTS} from '../../Constants';
import {SearchParams} from '../../reducers/StateTypes';
import {initialSettings} from '../../reducers/Settings';
import {loggedOutUser} from '../../reducers/User';
import {testLoggedInUser} from '../../reducers/User.test';
import {render, mount, unmountAll} from 'app/Testing';
import Search, {Props} from './Search';

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
  expansions: [],
};

describe('Search', () => {

  afterEach(unmountAll);

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
      onSearch: jasmine.createSpy('onSearch'),
      ...overrides,
    };
    return {props, e: <Search {...(props as any as Props)} />};
  }

  test('renders a small selection of quests when user is not logged in', () => {
    const text = render(setup().e).text();
    expect(text).toContain("Sign in");
    expect(text).toContain("Oust Albanus");
  });
  test('gracefully handles no search results', () => {
    const text = render(setup({user: testLoggedInUser}).e).text();
    expect(text).toContain("No quests found");
  });
  test('renders some search results', () => {
    const text = render(setup({user: testLoggedInUser, results: TUTORIAL_QUESTS}).e).text();
    expect(text).toContain("Learning");
  });
  test('shows spinner when loading results', () => {
    const e = render(setup({user: testLoggedInUser, searching: true}).e);
    expect(e.find('.lds-ellipsis').length).toEqual(1);
  });
  test('searches if user is logged in and no results', () => {
    const {props, e} = setup({
      user: {
        loggedIn: true,
      },
      results: null,
    });
    mount(e);
    expect(props.onSearch).toHaveBeenCalled();
  });
  test('does not search if user is not logged in', () => {
    const {props, e} = setup({
      user: {
        loggedIn: false,
      },
    });
    mount(e);
    expect(props.onSearch).not.toHaveBeenCalled();
  });
  test('does not search if there are already results', () => {
    const {props, e} = setup({
      user: {
        loggedIn: true,
      },
      results: ['a'],
    });
    mount(e);
    expect(props.onSearch).not.toHaveBeenCalled();
  });
});
