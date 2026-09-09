import * as React from 'react';
import { shallow } from 'enzyme';
import Button from '@material-ui/core/Button';
import Checked from '@material-ui/icons/CheckBox';
import Unchecked from '@material-ui/icons/CheckBoxOutlineBlank';
import Checkbox from './Checkbox';
test.each([false, true])('renders checked=%s and toggles on tap', value => {
  const onChange = jest.fn();
  const view = shallow(
    <Checkbox label="Horror" value={value} onChange={onChange} />,
  );
  expect(view.find(value ? Checked : Unchecked)).toHaveLength(1);
  expect(view.find(value ? Unchecked : Checked)).toHaveLength(0);
  view.find(Button).simulate('click');
  expect(onChange).toHaveBeenCalledWith(!value);
  expect(view.find('.label').text()).toBe('Horror');
});
