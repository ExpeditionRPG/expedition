import * as React from 'react';
import { shallow } from 'enzyme';
import Button from '@material-ui/core/Button';
import Checkbox from './Checkbox';

test('tapping toggles the current value', () => {
  const onChange = jest.fn();
  const wrapper = shallow(
    <Checkbox label="Music" value={false} onChange={onChange} />,
  );
  wrapper.find(Button).simulate('click');
  expect(onChange).toHaveBeenLastCalledWith(true);
  wrapper.setProps({ value: true });
  wrapper.find(Button).simulate('click');
  expect(onChange).toHaveBeenLastCalledWith(false);
});
test('shows label and explanatory children', () => {
  const wrapper = shallow(
    <Checkbox label="Music" value={true} onChange={jest.fn()}>
      Background soundtrack
    </Checkbox>,
  );
  expect(wrapper.find('.label').text()).toBe('Music');
  expect(wrapper.find('.subtext').text()).toBe('Background soundtrack');
});
