import {configure, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import SavedQuests, {Props} from './SavedQuests';
import {FEATURED_QUESTS} from '../../Constants';
import {Quest} from 'shared/schema/Quests';

configure({ adapter: new Adapter() });

function setup(props: Partial<Props>) {
  const wrapper = render(<SavedQuests {...(props as any as Props)} />, undefined /*renderOptions*/);
  return {props, wrapper};
}

const SAVED_QUEST = {details: FEATURED_QUESTS[0], ts: 123, pathLen: 5};
const OFFLINE_QUEST = {details: FEATURED_QUESTS[0], ts: 123, pathLen: 0};

describe('SavedQuests', () => {
  test('prompts the user when there are no saved quests', () => {
    const {wrapper} = setup({
      saved: [],
    });
    expect(wrapper.text()).toContain('You have no saved/offline quests.');
  });
  test('shows only saved quests if no offline quests', () => {
    const {wrapper} = setup({
      saved: [SAVED_QUEST],
    });
    const text = wrapper.find('h3').text();
    expect(text).not.toContain('Offline Quests');
    expect(text).toContain('Saved Quests');
  });
  test('shows only offline quests if no saved quests', () => {
    const {wrapper} = setup({
      saved: [OFFLINE_QUEST],
    });
    const text = wrapper.find('h3').text();
    expect(text).not.toContain('Saved Quests');
    expect(text).toContain('Offline Quests');
  });
  test.skip('groups saves by quest and shows count', () => { /* TODO */ });
});
