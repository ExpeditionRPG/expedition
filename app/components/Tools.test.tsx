import * as React from 'react'
import {shallow} from 'enzyme'
import Tools, {ToolsProps} from './Tools'
import {initial_state} from '../reducers/Settings'

require('react-tap-event-plugin')();

function setup() {
  const props: ToolsProps = {
    settings: initial_state,
    onCustomCombatSelect: jasmine.createSpy('onCustomCombatSelect'),
    onQuestCreatorSelect: jasmine.createSpy('onQuestCreatorSelect'),
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
