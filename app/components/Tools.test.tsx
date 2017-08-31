import * as React from 'react'
import {shallow} from 'enzyme'
import Tools, {ToolsProps} from './Tools'
import {initial_state as settings_initial_state} from '../reducers/Settings'
import {initial_state as user_initial_state} from '../reducers/User'

require('react-tap-event-plugin')();

function setup() {
  const props: ToolsProps = {
    settings: settings_initial_state,
    user: user_initial_state,
    onCustomCombatSelect: jasmine.createSpy('onCustomCombatSelect'),
    onQuestCreatorSelect: jasmine.createSpy('onQuestCreatorSelect'),
    onPrivateQuestsSelect: jasmine.createSpy('onPrivateQuestsSelect'),
  }
  const enzymeWrapper = shallow(<Tools {...props} />);
  return {props, enzymeWrapper};
}

describe('Tools', () => {
  it('calls onCustomCombatSelect on custom combat select', () => {
    const {props, enzymeWrapper} = setup();
    const button = enzymeWrapper.find('#selectCustomCombat').simulate('touchTap');
    expect(props.onCustomCombatSelect).toHaveBeenCalledTimes(1);
  });
});
