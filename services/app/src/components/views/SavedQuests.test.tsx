import {configure, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import {Provider} from 'react-redux';
import {newMockStore} from 'app/Testing';
import SavedQuests, {Props} from './SavedQuests';
import {TUTORIAL_QUESTS} from '../../Constants';
import {loggedOutUser} from '../../reducers/User';
import {Quest} from 'shared/schema/Quests';

configure({ adapter: new Adapter() });

function setup(props: Partial<Props>) {
  const store = newMockStore({saved: {list: []}, userQuests: {history: {}}, user: loggedOutUser});
  const e = render(<Provider store={store}><SavedQuests {...(props as any as Props)} /></Provider>, undefined /*renderOptions*/);
  return {props, e};
}

const SAVED_QUEST = {details: TUTORIAL_QUESTS[0], ts: 123, pathLen: 5};
const OFFLINE_QUEST = {details: TUTORIAL_QUESTS[0], ts: 123, pathLen: 0};

describe('SavedQuests', () => {
  test('prompts the user when there are no saved quests', () => {
    const {e} = setup({
      saved: [],
    });
    expect(e.text()).toContain('You have no saved or offline quests.');
  });
  test('shows only saved quests if no offline quests', () => {
    const {e} = setup({
      saved: [SAVED_QUEST],
    });
    const text = e.find('.textDivider').text();
    expect(text).not.toContain('Offline');
    expect(text).toContain('Saved');
  });
  test('shows only offline quests if no saved quests', () => {
    const {e} = setup({
      saved: [OFFLINE_QUEST],
    });
    const text = e.find('.textDivider').text();
    expect(text).not.toContain('Saved');
    expect(text).toContain('Offline');
  });
  test('groups saves by quest and shows count', () => {
    const {e} = setup({
      saved: [SAVED_QUEST, SAVED_QUEST, SAVED_QUEST],
    });
    const text = e.text();
    expect(text).toContain('3 saves');
  });
});
