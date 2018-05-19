import * as React from 'react'
import {shallow} from 'enzyme'
import SavedQuests, {SavedQuestsProps} from './SavedQuests'
import {loggedOutUser} from '../reducers/User'
import {initialSettings} from '../reducers/Settings'
import {QuestDetails} from '../reducers/QuestTypes'

require('react-tap-event-plugin')();

const renderOptions = {context: {muiTheme: getMuiTheme()}, childContextTypes: {muiTheme: React.PropTypes.object}};

function setup(props: Partial<SavedQuestsProps>) {
  const enzymeWrapper = render(<SavedQuests {...(props as any as SavedQuestsProps)} />, renderOptions;
  return {props, enzymeWrapper};
}

describe('SavedQuests', () => {
  it('promps the user when there are no saved quests', () => {
    const {props, enzymeWrapper} = setup({
      phase: 'LIST',
      saved: [],
      selected: null,
    });
    expect(enzymeWrapper.text()).toContain('You have no saved quests.');
  });
  it('shows selected saved quest', () => {
    const {props, enzymeWrapper} = setup({
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
        ts: 12345
      },
    });
    expect(enzymeWrapper.contains(<h2>Test Quest</h2>)).toEqual(true);
  });
  it('shows loading state when no quest selected', () => {
    const {props, enzymeWrapper} = setup({
      phase: 'DETAILS',
      saved: [],
      selected: null,
    });
    expect(enzymeWrapper.text()).toContain('Loading...');
  });
});
