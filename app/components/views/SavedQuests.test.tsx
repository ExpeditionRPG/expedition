import * as React from 'react'
import {render} from 'enzyme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import SavedQuests, {SavedQuestsProps} from './SavedQuests'
import {loggedOutUser} from '../../reducers/User'
import {initialSettings} from '../../reducers/Settings'
import {QuestDetails} from '../../reducers/QuestTypes'

require('react-tap-event-plugin')();

const renderOptions = {context: {muiTheme: getMuiTheme()}, childContextTypes: {muiTheme: React.PropTypes.object}};

function setup(props: Partial<SavedQuestsProps>) {
  const wrapper = render(<SavedQuests {...(props as any as SavedQuestsProps)} />, renderOptions);
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
        ts: 12345
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
