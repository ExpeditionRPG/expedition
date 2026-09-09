import * as React from 'react';
import { shallow } from 'enzyme';
import TextDivider from './TextDivider';

test('renders and updates divider text', () => {
  const wrapper = shallow(<TextDivider text="Choose one" />);
  expect(wrapper.find('.textDivider span').text()).toBe('Choose one');
  wrapper.setProps({ text: 'OR' });
  expect(wrapper.text()).toBe('OR');
});
