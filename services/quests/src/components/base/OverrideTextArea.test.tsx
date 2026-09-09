import * as React from 'react';
import { shallow } from 'enzyme';
import { OverrideTextArea } from './OverrideTextArea';
test('edits locally, commits on blur and accepts an external override', () => {
  const onBlur = jest.fn();
  const view = shallow(<OverrideTextArea value="old" onBlur={onBlur} />);
  expect(view.find('textarea').prop('value')).toBe('old');
  view.find('textarea').simulate('change', { target: { value: 'edited' } });
  expect(view.find('textarea').prop('value')).toBe('edited');
  expect(onBlur).not.toHaveBeenCalled();
  const event = { target: { value: 'edited' } };
  view.find('textarea').simulate('blur', event);
  expect(onBlur).toHaveBeenCalledWith(event);
  view.setProps({ value: 'override' });
  expect(view.find('textarea').prop('value')).toBe('override');
});
