import {configure, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import {Provider} from 'react-redux';
import {initialCardState} from '../reducers/Card';
import {initialQuestState} from '../reducers/Quest';
import {initialServerStatusState} from '../reducers/ServerStatus';
import {initialSettings} from '../reducers/Settings';
import {initialSnackbar} from '../reducers/Snackbar';
import {loggedOutUser} from 'shared/auth/UserState';
import {newMockStore} from '../Testing';
import Compositor, {Props} from './Compositor';
configure({ adapter: new Adapter() });

function setup(props: Partial<Props>) {
  props = {
    card: initialCardState,
    quest: initialQuestState,
    settings: initialSettings,
    snackbar: initialSnackbar,
    theme: 'light',
    transition: 'instant',
    ...props,
  };
  const store = newMockStore({
    card: props.card || initialCardState,
    multiplayer: {session: null, clientStatus: {}},
    quest: initialQuestState,
    saved: {list: []},
    search: {results: []},
    serverstatus: initialServerStatusState,
    settings: initialSettings,
    user: loggedOutUser,
    userQuests: {history: {}},
    _history: [],
  });
  const wrapper = render(
    <Provider store={store}>
      <Compositor {...(props as any as Props)} />
    </Provider>,
    {} // renderOptions
  );
  return {props, wrapper};
}

describe('Compositor', () => {
  test('Renders provided card, i.e. splash screen', () => {
    const {wrapper} = setup({});
    expect(wrapper.text()).toContain('To Begin:');
  });

  test('Renders nav footer for navigation card', () => {
    const {wrapper} = setup({card: {name: 'TUTORIAL_QUESTS'}});
    expect(wrapper.find('#navfooter').html()).not.toEqual(null);
  });

  test('Hides nav footer for non-navigation card', () => {
    const {wrapper} = setup();
    expect(wrapper.find('#navfooter').html()).toEqual(null);
  });

  test('Renders multiplayer footer for non-navigation card', () => {
    const {wrapper} = setup({
      card: {name: 'QUEST_PREVIEW'},
      multiplayer: {session: 'abcd', clientStatus: {}},
    });
    expect(wrapper.find('.remote_footer').html()).not.toEqual(null);
  });

  test('Includes has_footer card class when navigation card', () => {
    const {wrapper} = setup({card: {name: 'TUTORIAL_QUESTS'}});
    expect(wrapper.find('.has_footer').html()).not.toEqual(null);
  });
});
