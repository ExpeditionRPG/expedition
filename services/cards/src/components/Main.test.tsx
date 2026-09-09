import * as React from 'react';
import { shallow } from 'enzyme';
import Main from './Main';
import RendererContainer from './RendererContainer';
import TopBarContainer from './TopBarContainer';

test('shows loading progress until cards load, retaining controls and renderer', () => {
  const wrapper = shallow(<Main loading={true} />);
  expect(wrapper.find('#loading .sk-child')).toHaveLength(12);
  expect(wrapper.find(TopBarContainer)).toHaveLength(1);
  expect(wrapper.find(RendererContainer)).toHaveLength(1);
  wrapper.setProps({ loading: false });
  expect(wrapper.find('#loading')).toHaveLength(0);
  expect(wrapper.find(RendererContainer)).toHaveLength(1);
});
