import { shallow } from 'enzyme';
import { mount, unmountAll } from 'app/Testing';
import * as React from 'react';
import { loggedOutUser } from 'shared/auth/UserState';
import { initialMultiplayer } from '../../reducers/Multiplayer';
import { initialSettings } from '../../reducers/Settings';
import SplashScreen, { Props } from './SplashScreen';

jest.useFakeTimers();

describe('SplashScreen', () => {
  afterEach(unmountAll);

  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      announcement: null,
      onAnnouncementTap: jest.fn(),
      onPlayerCountSelect: jest.fn(),
      onPlayerManualSelect: jest.fn(),
      ...overrides,
    };
    const e = mount(<SplashScreen {...props} />);
    return { e, props };
  }

  test('Calls onPlayerCountSelect on tap and hold', () => {
    const { e, props } = setup();
    const mtt = e.find('MultiTouchTrigger');
    mtt.prop('onTouchChange')(3);
    jest.runOnlyPendingTimers();
    expect(props.onPlayerCountSelect).toHaveBeenCalledWith(3);
  });

  test('Clears player count select timeout when component unmounts', () => {
    const { e, props } = setup();
    const mtt = e.find('MultiTouchTrigger');
    mtt.prop('onTouchChange')(1);
    unmountAll();
    jest.runOnlyPendingTimers();
    expect(props.onPlayerCountSelect).not.toHaveBeenCalled();
  });
});

describe('player counter animation lifecycle', () => {
  afterEach(unmountAll);

  test.each(['release', 'unmount', 'complete', 'double tap'])(
    'keeps one frame chain and stops it on %s',
    stop => {
      const frames = new Map<number, FrameRequestCallback>();
      let nextFrame = 0;
      jest
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation(callback => {
          frames.set(++nextFrame, callback);
          return nextFrame;
        });
      jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => {
        frames.delete(id);
      });
      const select = jest.fn();
      const manual = jest.fn();
      const e = shallow(
        <SplashScreen
          announcement={null}
          onAnnouncementTap={jest.fn()}
          onPlayerCountSelect={select}
          onPlayerManualSelect={manual}
        />,
      );
      const counter = e.find('PlayerCounter').dive();
      const touch = counter.find('MultiTouchTrigger').prop('onTouchChange');
      touch(1);
      touch(2);
      touch(3);
      expect(frames.size).toBe(1);
      // Repeated frames at the same time must still retain the newest request ID.
      for (let i = 0; i < 3; i++) {
        const callbacks = Array.from(frames.values());
        frames.clear();
        callbacks.forEach(callback => callback(0));
        expect(frames.size).toBe(1);
      }
      if (stop === 'release') {
        touch(0);
      } else if (stop === 'unmount') {
        counter.unmount();
      } else if (stop === 'double tap') {
        touch(0);
        touch(1);
        expect(manual).toHaveBeenCalledTimes(1);
      } else {
        jest.advanceTimersByTime(2000);
        expect(select).toHaveBeenCalledWith(3);
      }
      expect(frames.size).toBe(0);
      jest.advanceTimersByTime(2000);
      expect(select).toHaveBeenCalledTimes(stop === 'complete' ? 1 : 0);
    },
  );
});
