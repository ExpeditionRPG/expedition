import {configure, render} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import {QuestDetails} from '../../reducers/QuestTypes';
import SavedQuests, {SavedQuestsProps} from './SavedQuests';
configure({ adapter: new Adapter() });

function setup(props: Partial<SavedQuestsProps>) {
  const wrapper = render(<SavedQuests {...(props as any as SavedQuestsProps)} />, undefined /*renderOptions*/);
  return {props, wrapper};
}

describe('SavedQuests', () => {
  it('promps the user when there are no saved quests', () => {
    const {props, wrapper} = setup({
      phase: 'LIST',
      saved: [],
      selected: null,
    });
    expect(wrapper.text()).toContain('You have no saved quests.');
  });
  it('shows selected saved quest', () => {
    const {props, wrapper} = setup({
      phase: 'DETAILS',
      saved: [],
      selected: {
        details: {
          title: 'Test Quest',
          summary: 'Test Summary',
          author: 'Test Testerson',
          id: 'test',
          contentrating: 'Teen',
          maxplayers: 5,
          minplayers: 1,
          genre: 'Horror',
          published: Date.now(),
        } as any as QuestDetails,
        ts: 12345,
      },
    });
    expect(wrapper.html()).toContain('<h2>Test Quest</h2>');
  });
  it('shows loading state when no quest selected', () => {
    const {props, wrapper} = setup({
      phase: 'DETAILS',
      saved: [],
      selected: null,
    });
    expect(wrapper.text()).toContain('Loading...');
  });
});
