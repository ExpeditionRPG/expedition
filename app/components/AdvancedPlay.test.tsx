import * as React from 'react'
import { shallow } from 'enzyme'
import AdvancedPlay, {AdvancedPlayProps} from './AdvancedPlay'
import {initial_state} from '../reducers/Settings'

require('react-tap-event-plugin')();

function setup() {
  const props: AdvancedPlayProps = {
    settings: initial_state,
    onCustomCombatSelect: jasmine.createSpy('onCustomCombatSelect'),
    onQuestCreatorSelect: jasmine.createSpy('onQuestCreatorSelect'),
  }
  const enzymeWrapper = shallow(<AdvancedPlay {...props} />)
  return {props, enzymeWrapper};
}

describe('AdvancedPlay', () => {
  it('calls onCustomCombatSelect on custom combat select', () => {
    const { props, enzymeWrapper } = setup()
    const button = enzymeWrapper.find('Button').simulate('touchTap');
    expect(props.onCustomCombatSelect).toHaveBeenCalledTimes(1);
  });
});
