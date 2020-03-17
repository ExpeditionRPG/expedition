import {mount, unmountAll} from 'app/Testing';
import * as React from 'react';
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
    } as any;
    const e = mount(<SplashScreen {...props} />);
    return {e, props};
  }

  test('Calls onPlayerCountSelect on tap and hold', () => {
    const {e, props} = setup();
    const mtt = e.find('MultiTouchTrigger');
    (mtt.prop('onTouchChange') as any)(3);
    jest.runOnlyPendingTimers();
    expect(props.onPlayerCountSelect).toHaveBeenCalledWith(3);
  });

  test('Clears player count select timeout when component unmounts', () => {
    const {e, props} = setup();
    const mtt = e.find('MultiTouchTrigger');
    (mtt.prop('onTouchChange') as any)(1);
    unmountAll();
    jest.runOnlyPendingTimers();
    expect(props.onPlayerCountSelect).not.toHaveBeenCalled();
  });
});
