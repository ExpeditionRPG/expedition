import * as React from 'react';
import { shallow } from 'enzyme';
import Select from '@material-ui/core/Select';
import IconButton from '@material-ui/core/IconButton';
import TopBar from './TopBar';
import { initialState } from '../reducers/Filters';

function setup() {
  const props = {
    filters: initialState,
    printing: false,
    downloadCards: jest.fn(),
    handleFilterChange: jest.fn(),
    openHelp: jest.fn(),
  };
  return { props, wrapper: shallow(<TopBar {...props} />) };
}
test('loads all current filters', () => {
  const { wrapper } = setup();
  expect(wrapper.find(Select).map(select => select.prop('value'))).toEqual(
    Object.values(initialState).map(filter => filter.current),
  );
});
test('reloads the selected source', () => {
  const { wrapper, props } = setup();
  wrapper.find(IconButton).at(0).simulate('click');
  expect(props.downloadCards).toHaveBeenCalledWith(initialState.source.current);
});
test('changes the named filter', () => {
  const { wrapper, props } = setup();
  wrapper
    .find(Select)
    .at(0)
    .simulate('change', { target: { value: 'Encounter' } });
  expect(props.handleFilterChange).toHaveBeenCalledWith('sheet', 'Encounter');
});
test('opens help and hides controls for printing', () => {
  const { wrapper, props } = setup();
  wrapper.find(IconButton).at(1).simulate('click');
  expect(props.openHelp).toHaveBeenCalledTimes(1);
  wrapper.setProps({ printing: true });
  expect(wrapper.isEmptyRender()).toBe(true);
});
