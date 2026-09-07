import { mount, render, unmountAll } from 'app/Testing';
import * as React from 'react';
import { loggedOutUser } from 'shared/auth/UserState';
import { Expansion } from 'shared/schema/Constants';
import { Quest } from 'shared/schema/Quests';
import { TUTORIAL_QUESTS } from '../../Constants';
import { initialSettings } from '../../reducers/Settings';
import { SearchParams } from '../../reducers/StateTypes';
import { TEST_SEARCH } from '../../reducers/TestData';
import { testLoggedInUser } from '../../reducers/User.test';
import Search, { Props } from './Search';

const Moment = require('moment');

describe('Search', () => {
  afterEach(unmountAll);

  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      params: TEST_SEARCH,
      settings: initialSettings,
      contentSets: new Set([Expansion.horror]),
      user: loggedOutUser,
      results: [],
      searching: false,
      toCard: jest.fn(),
      onReturn: jest.fn(),
      onQuest: jest.fn(),
      onSearch: jest.fn(),
      ...overrides,
    };
    return { props, e: <Search {...props} /> };
  }

  test('renders a small selection of quests when user is not logged in', () => {
    const text = render(setup().e).text();
    expect(text).toContain('Sign in');
    expect(text).toContain('Oust Albanus');
  });
  test('gracefully handles no search results', () => {
    const text = render(setup({ user: testLoggedInUser }).e).text();
    expect(text).toContain('No quests found');
  });
  test('renders some search results', () => {
    const text = render(
      setup({ user: testLoggedInUser, results: TUTORIAL_QUESTS }).e,
    ).text();
    expect(text).toContain('Learning');
  });
  test('shows spinner when loading results', () => {
    const e = render(setup({ user: testLoggedInUser, searching: true }).e);
    expect(e.find('.lds-ellipsis').length).toEqual(1);
  });
  test('searches if user is logged in and no results', () => {
    const { props, e } = setup({
      user: {
        loggedIn: true,
      },
      results: null,
    });
    mount(e);
    expect(props.onSearch).toHaveBeenCalled();
  });
  test('does not search if user is not logged in', () => {
    const { props, e } = setup({
      user: {
        loggedIn: false,
      },
    });
    mount(e);
    expect(props.onSearch).not.toHaveBeenCalled();
  });
  test('does not search if there are already results', () => {
    const { props, e } = setup({
      user: {
        loggedIn: true,
      },
      results: ['a'],
    });
    mount(e);
    expect(props.onSearch).not.toHaveBeenCalled();
  });
  test('shows only configured content set icons', () => {
    const e = mount(
      setup({ user: testLoggedInUser, results: TUTORIAL_QUESTS }).e,
    );
    expect(e.find('#searching_horror').exists()).toEqual(true);
    expect(e.find('#searching_future').exists()).toEqual(false);
  });
});
