import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
configure({ adapter: new Adapter() });

import {initialSettings} from '../../reducers/Settings';
import {loggedOutUser} from '../../reducers/User';
import Tools, {Props} from './Tools';

function setup() {
  const props: Props = {
    onCustomCombatSelect: jasmine.createSpy('onCustomCombatSelect'),
    onMultiplayerSelect: jasmine.createSpy('onMultiplayerSelect'),
    onPrivateQuestsSelect: jasmine.createSpy('onPrivateQuestsSelect'),
    onQuestCreatorSelect: jasmine.createSpy('onQuestCreatorSelect'),
    settings: initialSettings,
    testMusic: jasmine.createSpy('testMusic'),
    user: loggedOutUser,
  };
  return {props, e: shallow(<Tools {...props} />)};
}

describe('Tools', () => {
  test('calls onCustomCombatSelect on custom combat select', () => {
    const {props, e} = setup();
    e.find('#selectCustomCombat').simulate('click');
    expect(props.onCustomCombatSelect).toHaveBeenCalledTimes(1);
  });
});
