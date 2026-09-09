import * as React from 'react';
import { shallow } from 'enzyme';
import Button from '@material-ui/core/Button';
import StarRating from './StarRating';

test.each([0, 5])('shows %s filled stars', value => {
  const wrapper = shallow(<StarRating value={value} />);
  expect(wrapper.find('.filled')).toHaveLength(value);
  expect(wrapper.find('.outline')).toHaveLength(5 - value);
});
test('tapping each star sends its one-based rating', () => {
  const onChange = jest.fn();
  const wrapper = shallow(<StarRating value={0} onChange={onChange} />);
  wrapper.find(Button).forEach((button, i) => {
    button.simulate('click');
    expect(onChange).toHaveBeenLastCalledWith(i + 1);
  });
  wrapper.setProps({ readOnly: true });
  expect(wrapper.find(Button)).toHaveLength(0);
});
