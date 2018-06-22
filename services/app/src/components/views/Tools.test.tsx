import * as React from 'react'
import {configure, shallow} from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
configure({ adapter: new Adapter() });

import Tools, {ToolsProps} from './Tools'
import {loggedOutUser} from '../../reducers/User'
import {initialSettings} from '../../reducers/Settings'

function setup() {
  const props: ToolsProps = {
    user: loggedOutUser,
    settings: initialSettings,
    onCustomCombatSelect: jasmine.createSpy('onCustomCombatSelect'),
    onQuestCreatorSelect: jasmine.createSpy('onQuestCreatorSelect'),
    onPrivateQuestsSelect: jasmine.createSpy('onPrivateQuestsSelect'),
    onMultiplayerSelect: jasmine.createSpy('onMultiplayerSelect'),
    testMusic: jasmine.createSpy('testMusic'),
  }
  const enzymeWrapper = shallow(<Tools {...props} />);
  return {props, enzymeWrapper};
}

describe('Tools', () => {
  it('calls onCustomCombatSelect on custom combat select', () => {
    const {props, enzymeWrapper} = setup();
    enzymeWrapper.find('#selectCustomCombat').simulate('click');
    expect(props.onCustomCombatSelect).toHaveBeenCalledTimes(1);
  });
});
