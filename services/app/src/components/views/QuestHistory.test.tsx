import {configure, render} from 'enzyme';
import * as React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import {TUTORIAL_QUESTS} from 'app/Constants';
import {initialSettings} from 'app/reducers/Settings';
import {loggedOutUser} from 'app/reducers/User';
import QuestHistory, {Props} from './QuestHistory';
import {newMockStore} from 'app/Testing';
import {Provider} from 'react-redux';
configure({ adapter: new Adapter() });

describe('QuestHistory', () => {
  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      played: {},
      onSelect: jasmine.createSpy('onSelect'),
      onReturn: jasmine.createSpy('onReturn'),
      ...overrides,
    };
    const store = newMockStore({saved: {list: []}, userQuests: {history: {}}, user: loggedOutUser});
    const e = render(<Provider store={store}><QuestHistory {...(props as any as Props)} /></Provider>, undefined /*renderOptions*/);
    return {props, e};
  }

  test('informs user when no played quests', () => {
    const text = setup().e.text();
    expect(text).toContain('You haven\'t played any quests yet');
  });

  test('displays played quests', () => {
    const {e} = setup({played: {
      [TUTORIAL_QUESTS[0].id]: {details: TUTORIAL_QUESTS[0], lastPlayed: new Date()},
    }});
    expect(e.text()).toContain(TUTORIAL_QUESTS[0].title);
  });
});
