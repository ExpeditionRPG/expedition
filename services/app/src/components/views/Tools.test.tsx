import {configure, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
configure({ adapter: new Adapter() });

import {initialSettings} from '../../reducers/Settings';
import {loggedOutUser} from '../../reducers/User';
import Tools, {ToolsProps} from './Tools';

function setup() {
  const props: ToolsProps = {
    onCustomCombatSelect: jasmine.createSpy('onCustomCombatSelect'),
    onMultiplayerSelect: jasmine.createSpy('onMultiplayerSelect'),
    onPrivateQuestsSelect: jasmine.createSpy('onPrivateQuestsSelect'),
    onQuestCreatorSelect: jasmine.createSpy('onQuestCreatorSelect'),
    settings: initialSettings,
    testMusic: jasmine.createSpy('testMusic'),
    user: loggedOutUser,
  };
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
