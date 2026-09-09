jest.mock('react-split-pane', () => ({ default: 'SplitPane' }));
import * as React from 'react';
import { shallow } from 'enzyme';
import Button from '@material-ui/core/Button';
import SplitPane from 'react-split-pane';
import Main from './Main';
import SplashContainer from './SplashContainer';
import ContextEditorContainer from './ContextEditorContainer';
import { defaultState } from '../reducers/Editor';
function setup(extra: any = {}) {
  const props = {
    editor: defaultState,
    loggedIn: true,
    bottomPanel: null,
    snackbar: { open: false, message: '' },
    quest: { id: 'q' },
    onDragFinished: jest.fn(),
    onLineNumbersToggle: jest.fn(),
    onPanelToggle: jest.fn(),
    onSnackbarClose: jest.fn(),
    ...extra,
  };
  return { props, view: shallow(<Main {...props} />) };
}
test('shows splash when logged out or without a quest', () => {
  expect(setup({ loggedIn: false }).view.find(SplashContainer)).toHaveLength(1);
  expect(setup({ quest: {} }).view.find(SplashContainer)).toHaveLength(1);
});
test('shows the selected drawer, forwards resize, and hides it when closed', () => {
  const { view, props } = setup({ bottomPanel: 'CONTEXT' });
  expect(view.find(ContextEditorContainer)).toHaveLength(1);
  view.find(SplitPane).simulate('dragFinished', 400);
  expect(props.onDragFinished).toHaveBeenCalledWith(400);
  view.setProps({ bottomPanel: null });
  expect(view.find(SplitPane)).toHaveLength(0);
  expect(view.find(ContextEditorContainer)).toHaveLength(0);
});
test('dispatches panel and line-number toggles', () => {
  const { view, props } = setup();
  view.find(Button).at(0).simulate('click');
  expect(props.onPanelToggle).toHaveBeenCalledWith('CONTEXT');
  view.find(Button).at(1).simulate('click');
  expect(props.onPanelToggle).toHaveBeenLastCalledWith('NOTES');
  view.find(Button).at(2).simulate('click');
  expect(props.onLineNumbersToggle).toHaveBeenCalledTimes(1);
});
test('shows loading and fatal errors before the editor', () => {
  expect(
    setup({ editor: { ...defaultState, loadingQuest: true } }).view.text(),
  ).toContain('Loading Expedition');
  expect(
    setup({ editor: { ...defaultState, fatalError: 'offline' } }).view.text(),
  ).toContain('offline');
});
