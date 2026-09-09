import { shallow } from 'enzyme';
import * as React from 'react';
import { newMockStore } from '../../Testing';
import MultiplayerAffector, { Props } from './MultiplayerAffector';

describe('MultiplayerAffector', () => {
  function setup(overrides: Partial<Props> = {}): Env {
    const store = newMockStore();
    const props: Props = {
      id: 'test',
      abortOnScroll: true,
      children: null,
      className: '',
      includeLocalInteractions: true,
      onInteraction: jest.fn(),
      lazy: true,
      onEvent: jest.fn(),
      onSubscribe: jest.fn(),
      onUnsubscribe: jest.fn(),
      ...overrides,
    };
    return {
      store,
      props,
      a: shallow(<MultiplayerAffector {...props} />, undefined),
    };
  }

  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
  });

  afterEach(() => {
    window.requestAnimationFrame.mockRestore();
  });

  test('Publishes interactions for remote clients', () => {
    const { a, props } = setup({ lazy: false });
    const instance = a.instance();
    instance.onRef({
      offsetHeight: 100,
      offsetWidth: 200,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getBoundingClientRect: () => ({ left: 50, top: 100 }),
    });
    instance.processInput('touchstart', { 7: [150, 125] });
    expect(props.onEvent).toHaveBeenCalledWith({
      type: 'INTERACTION',
      id: 'test',
      event: 'touchstart',
      positions: { 7: [500, 250] },
    });
    props.onEvent.mockClear();
    instance.processInput('touchmove', { 7: [150, 130] });
    expect(props.onEvent).not.toHaveBeenCalled();
    expect(props.onInteraction).toHaveBeenLastCalledWith(
      'local',
      expect.objectContaining({ event: 'touchmove' }),
    );
    const handler = props.onSubscribe.mock.calls[0][0];
    handler({
      client: 'peer',
      instance: 'device',
      event: {
        type: 'INTERACTION',
        id: 'test',
        event: 'touchend',
        positions: {},
      },
    });
    expect(props.onInteraction).toHaveBeenLastCalledWith(
      'peer|device',
      expect.objectContaining({ event: 'touchend' }),
    );
    a.unmount();
    expect(props.onUnsubscribe).toHaveBeenCalledWith(handler);
  });
  test('Publishes interaction with children that suppress events', () => {
    const { a, props } = setup();
    const parent = document.createElement('div');
    const child = document.createElement('button');
    parent.appendChild(child);
    Object.defineProperties(parent, {
      offsetWidth: { value: 100 },
      offsetHeight: { value: 100 },
    });
    child.addEventListener('mousedown', event => event.stopPropagation());
    a.instance().onRef(parent);
    child.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        button: 0,
        clientX: 25,
        clientY: 50,
      }),
    );
    expect(props.onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'touchstart',
        positions: { 0: [250, 500] },
      }),
    );
    a.unmount();
  });

  test('resizes touch position to 0-1000', () => {
    const { a, props } = setup();
    a.instance().onRef({
      offsetHeight: 500,
      offsetWidth: 100,
      addEventListener: jest.fn(),
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
    });
    a.instance().processInput('mousemove', { a: [12, 50] });
    expect(props.onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        positions: { a: [120, 100] },
      }),
    );
  });

  test('wraps negative X touch position', () => {
    const { a, props } = setup();
    a.instance().onRef({
      offsetHeight: 100,
      offsetWidth: 100,
      addEventListener: jest.fn(),
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
    });
    a.instance().processInput('mousemove', { a: [-50, 50] });
    expect(props.onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        positions: { a: [500, 500] },
      }),
    );
  });
});
