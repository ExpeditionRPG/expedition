import * as React from 'react'
import {shallow} from 'enzyme'
import Tools, {ToolsProps} from './Tools'
import {initialUser} from '../reducers/User'
import {initialSettings} from '../reducers/Settings'

require('react-tap-event-plugin')();

function setup() {
  const props: ToolsProps = {
    user: initialUser,
    settings: initialSettings,
    onCustomCombatSelect: jasmine.createSpy('onCustomCombatSelect'),
    onQuestCreatorSelect: jasmine.createSpy('onQuestCreatorSelect'),
    onPrivateQuestsSelect: jasmine.createSpy('onPrivateQuestsSelect'),
    onRemotePlaySelect: jasmine.createSpy('onRemotePlaySelect'),
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
