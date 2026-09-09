import * as React from 'react';
import { shallow } from 'enzyme';
import Button from '@material-ui/core/Button';
import ContextEditor from './ContextEditor';
import { OverrideTextArea } from './base/OverrideTextArea';
test('displays, edits and restores initial context from chronological history', () => {
  const onInitialContext = jest.fn();
  const view = shallow(
    <ContextEditor
      opInit="gold = 1"
      scopeHistory={[{ z: 2, a: 1, _: {} }, { gold: 3 }]}
      onInitialContext={onInitialContext}
    />,
  );
  expect(view.find(OverrideTextArea).prop('value')).toBe('gold = 1');
  expect(view.find(Button)).toHaveLength(2);
  expect(view.find(Button).at(0).children().at(1).text()).toContain('a: 1');
  expect(view.find(Button).at(0).children().at(1).text()).not.toContain('_:');
  view.find(Button).at(0).simulate('click');
  expect(onInitialContext).toHaveBeenLastCalledWith('a = 1\nz = 2\n');
  view
    .find(OverrideTextArea)
    .simulate('blur', { target: { value: 'gold = 4' } });
  expect(onInitialContext).toHaveBeenLastCalledWith('gold = 4');
  view.setProps({ scopeHistory: [] });
  expect(view.find('.noScope').text()).toContain('Empty scope history');
});
