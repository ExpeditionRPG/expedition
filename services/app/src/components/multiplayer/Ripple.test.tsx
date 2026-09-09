import * as React from 'react';
import { shallow } from 'enzyme';
import { Transition } from 'react-transition-group';
import Ripple from './Ripple';

test('positions the ripple and applies enter/exit animation classes', () => {
  const e = shallow(
    <Ripple
      classes={{
        ripple: 'ripple',
        rippleVisible: 'visible',
        child: 'child',
        childLeaving: 'leaving',
      }}
      rippleSize={40}
      rippleX={75}
      rippleY={100}
    />,
  );
  expect(e.find('span').at(0).prop('style')).toEqual({
    height: 40,
    width: 40,
    left: 55,
    top: 80,
  });
  expect(e.find('span').at(0).hasClass('visible')).toBe(false);
  e.find(Transition).prop('onEnter')();
  expect(e.find('span').at(0).hasClass('visible')).toBe(true);
  e.find(Transition).prop('onExit')();
  expect(e.find('span').at(1).hasClass('leaving')).toBe(true);
  e.unmount();
});
