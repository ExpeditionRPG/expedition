import * as React from 'react'
import {shallow} from 'enzyme'
import AudioControls, {AudioControlsProps} from './AudioControls'

require('react-tap-event-plugin')();

function setup(overrides: Partial<AudioControlsProps>) {
  const props: AudioControlsProps = {
    audioLoaded: 'UNLOADED',
    audioEnabled: true,
    onAudioToggle: jasmine.createSpy('onAudioToggle'),
    ...overrides,
  };
  const enzymeWrapper = shallow(<AudioControls {...props} />);
  return {props, enzymeWrapper};
}

describe('AudioControls', () => {
  it('Disabled audio if enabled', () => {
    const {props, enzymeWrapper} = setup({audioEnabled: true});
    enzymeWrapper.find('#audioToggle').simulate('touchTap');
    expect(props.onAudioToggle).toHaveBeenCalledTimes(1);
    expect(props.onAudioToggle).toHaveBeenCalledWith(false);
  });

  it('Enables audio if disabled', () => {
    const {props, enzymeWrapper} = setup({audioEnabled: false});
    enzymeWrapper.find('#audioToggle').simulate('touchTap');
    expect(props.onAudioToggle).toHaveBeenCalledTimes(1);
    expect(props.onAudioToggle).toHaveBeenCalledWith(true);
  });

  it('Shows loading indicator if audio loading', () => {
    const {props, enzymeWrapper} = setup({audioLoaded: 'LOADING'});
    expect(enzymeWrapper.find('#audioLoadingIndicator').exists()).toEqual(true);
    expect(enzymeWrapper.find('#audioLoadError').exists()).toEqual(false);
  });

  it('Shows error indicator if error loading audio', () => {
    const {props, enzymeWrapper} = setup({audioLoaded: 'ERROR'});
    expect(enzymeWrapper.find('#audioLoadError').exists()).toEqual(true);
  });

  it('Does not show loading indicator if audio not loaded', () => {
    const {props, enzymeWrapper} = setup({audioLoaded: 'LOADED'});
    expect(enzymeWrapper.find('#audioLoadingIndicator').exists()).toEqual(false);
    expect(enzymeWrapper.find('#audioLoadError').exists()).toEqual(false);
  });

  it('Does not show loading indicator if audio fully loaded', () => {
    const {props, enzymeWrapper} = setup({audioLoaded: 'LOADED'});
    expect(enzymeWrapper.find('#audioLoadingIndicator').exists()).toEqual(false);
  });
});
