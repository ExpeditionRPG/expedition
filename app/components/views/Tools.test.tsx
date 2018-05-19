import * as React from 'react'
import {shallow} from 'enzyme'
import Tools, {ToolsProps} from './Tools'
import {loggedOutUser} from '../../reducers/User'
import {initialSettings} from '../../reducers/Settings'

require('react-tap-event-plugin')();

function setup() {
  const props: ToolsProps = {
    user: loggedOutUser,
    settings: initialSettings,
    onCustomCombatSelect: jasmine.createSpy('onCustomCombatSelect'),
    onQuestCreatorSelect: jasmine.createSpy('onQuestCreatorSelect'),
    onPrivateQuestsSelect: jasmine.createSpy('onPrivateQuestsSelect'),
    onMultiplayerSelect: jasmine.createSpy('onMultiplayerSelect'),
    testMusic: jasmine.createSpy('testMusic'),
    testMusicRandom: jasmine.createSpy('testMusicRandom'),
    testMusicStop: jasmine.createSpy('testMusicStop'),
    testSfx: jasmine.createSpy('testSfx'),
  }
  const enzymeWrapper = shallow(<Tools {...props} />);
  return {props, enzymeWrapper};
}

describe('Tools', () => {
  it('calls onCustomCombatSelect on custom combat select', () => {
    const {props, enzymeWrapper} = setup();
    enzymeWrapper.find('#selectCustomCombat').simulate('touchTap');
    expect(props.onCustomCombatSelect).toHaveBeenCalledTimes(1);
  });
});
