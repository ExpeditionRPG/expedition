import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import AudioControls, {Props} from './AudioControls';
configure({ adapter: new Adapter() });

function setup(overrides: Partial<Props>) {
  const props: Props = {
    audioEnabled: true,
    audioLoaded: 'UNLOADED',
    onAudioToggle: jasmine.createSpy('onAudioToggle'),
    ...overrides,
  };
  const enzymeWrapper = shallow(<AudioControls {...props} />);
  return {props, enzymeWrapper};
}

describe('AudioControls', () => {
  test('Disabled audio if enabled', () => {
    const {props, enzymeWrapper} = setup({audioEnabled: true});
    enzymeWrapper.find('#audioToggle').simulate('click');
    expect(props.onAudioToggle).toHaveBeenCalledTimes(1);
    expect(props.onAudioToggle).toHaveBeenCalledWith(false);
  });

  test('Enables audio if disabled', () => {
    const {props, enzymeWrapper} = setup({audioEnabled: false});
    enzymeWrapper.find('#audioToggle').simulate('click');
    expect(props.onAudioToggle).toHaveBeenCalledTimes(1);
    expect(props.onAudioToggle).toHaveBeenCalledWith(true);
  });

  test('Shows loading indicator if audio loading', () => {
    const {enzymeWrapper} = setup({audioLoaded: 'LOADING'});
    expect(enzymeWrapper.find('#audioLoadingIndicator').exists()).toEqual(true);
    expect(enzymeWrapper.find('#audioLoadError').exists()).toEqual(false);
  });

  test('Shows error indicator if error loading audio', () => {
    const {enzymeWrapper} = setup({audioLoaded: 'ERROR'});
    expect(enzymeWrapper.find('#audioLoadError').exists()).toEqual(true);
  });

  test('Does not show loading indicator if audio not loaded', () => {
    const {enzymeWrapper} = setup({audioLoaded: 'LOADED'});
    expect(enzymeWrapper.find('#audioLoadingIndicator').exists()).toEqual(false);
    expect(enzymeWrapper.find('#audioLoadError').exists()).toEqual(false);
  });

  test('Does not show loading indicator if audio fully loaded', () => {
    const {enzymeWrapper} = setup({audioLoaded: 'LOADED'});
    expect(enzymeWrapper.find('#audioLoadingIndicator').exists()).toEqual(false);
  });
});
