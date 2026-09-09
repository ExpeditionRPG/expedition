import * as React from 'react';
import { shallow } from 'enzyme';
import Callout from './Callout';

test('displays child text and optional small icon', () => {
  const wrapper = shallow(<Callout>Roll a die</Callout>);
  expect(wrapper.find('.text').text()).toBe('Roll a die');
  expect(wrapper.find('img')).toHaveLength(0);
  wrapper.setProps({ icon: 'roll' });
  expect(wrapper.find('img').prop('src')).toBe('images/roll_small.svg');
});
