import {newMockStore} from '../../Testing';
import {configure, shallow} from 'enzyme';
import * as React from 'react';
import MultiplayerAffector, {Props} from './MultiplayerAffector';
import * as Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

describe('MultiplayerAffector', () => {
  function setup(overrides: Partial<Props> = {}): Env {
    const store = newMockStore();
    const props: Props = {
      id: "test",
      abortOnScroll: true,
      children: null,
      className: "",
      includeLocalInteractions: true,
      onInteraction: jest.fn(),
      lazy: true,
      onEvent: jest.fn(),
      onSubscribe: jest.fn(),
  	  onUnsubscribe: jest.fn(),
      ...overrides,
    };
    return {store, props, a: shallow(<MultiplayerAffector {...(props as any as Props)} />, undefined)};
  }

  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
  });

  afterEach(() => {
    window.requestAnimationFrame.mockRestore();
  });

  test.skip('Publishes interactions for remote clients', () => { /* TODO */ });
  test.skip('Publishes interaction with children that suppress events', () => { /* TODO */ });
  
  test('resizes touch position to 0-1000', () => {
    const {a, props} = setup();
    a.instance().onRef({
      offsetHeight: 500, 
      offsetWidth: 100,
      addEventListener: jest.fn(), 
      getBoundingClientRect: () => {return {left: 0, top: 0};},
    });
    a.instance().processInput("mousemove", {"a": [12,50]});
    expect(props.onEvent).toHaveBeenCalledWith(jasmine.objectContaining({
      positions: {"a": [120, 100]},
    }));
  });

  test('wraps negative X touch position', () => {
    const {a, props} = setup();
    a.instance().onRef({
      offsetHeight: 100, 
      offsetWidth: 100,
      addEventListener: jest.fn(), 
      getBoundingClientRect: () => {return {left: 0, top: 0};},
    });
    a.instance().processInput("mousemove", {"a": [-50,50]});
    expect(props.onEvent).toHaveBeenCalledWith(jasmine.objectContaining({
      positions: {"a": [500, 500]},
    }));
  });
});
