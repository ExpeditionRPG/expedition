import { shallow } from 'enzyme';
import * as React from 'react';
import { loggedOutUser } from 'shared/auth/UserState';
import { defaultState as initialEditor } from '../reducers/Editor';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import QuestAppBar from './QuestAppBar';
const TEST_QUEST = {
  id: 'q',
  title: 'Example Quest',
};

function setup(overrides: any) {
  const props: any = {
    annotations: [],
    quest: TEST_QUEST,
    editor: initialEditor,
    user: loggedOutUser,
    scope: null,
    onMenuSelect: jest.fn(),
    onUserDialogRequest: jest.fn(),
    onViewError: jest.fn(),
    playFromCursor: jest.fn(),
    ...overrides,
  };
  const e = shallow(<QuestAppBar {...props} />);
  return { props, e };
}

describe('QuestAppBar', () => {
  test('shows user menu and quest title', () => {
    const { e, props } = setup({});
    expect(e.find('.title').prop('children')).toBe('Example Quest');
    const anchor = document.createElement('button');
    e.find(IconButton).simulate('click', { currentTarget: anchor });
    expect(e.find(Menu).prop('open')).toBe(true);
    expect(e.find(Menu).prop('anchorEl')).toBe(anchor);
    e.find(MenuItem).at(1).simulate('click');
    expect(props.onUserDialogRequest).toHaveBeenCalledWith(props.user);
    e.find(Menu).simulate('close');
    expect(e.find(Menu).prop('open')).toBe(false);
  });
  test.each([
    ['New', 'NEW_QUEST'],
    ['Publish', 'PUBLISH_QUEST'],
    ['Unpublish', 'UNPUBLISH_QUEST'],
    ['View in Drive', 'DRIVE_VIEW'],
    ['View in App', 'APP_VIEW'],
    ['Help', 'HELP'],
  ])('dispatches %s', (label, action) => {
    const { e, props } = setup({
      quest: {
        ...TEST_QUEST,
        published: label === 'Publish' ? undefined : 'today',
      },
    });
    e.find(Button)
      .filterWhere(b => b.prop('children') === label)
      .simulate('click');
    expect(props.onMenuSelect).toHaveBeenCalledWith(action, props.quest);
  });
  test('plays from cursor with fresh or preserved context', () => {
    const { e, props } = setup({
      editor: { ...initialEditor, bottomPanel: 'CONTEXT' },
      scope: { gold: 3 },
    });
    e.find(Button)
      .filterWhere(b => b.prop('children') === 'Play from Cursor')
      .simulate('click');
    expect(props.playFromCursor).toHaveBeenLastCalledWith(
      {},
      props.editor,
      props.quest,
    );
    e.find(Button)
      .filterWhere(
        b => b.prop('children') === 'Play from Cursor (preserve context)',
      )
      .simulate('click');
    expect(props.playFromCursor).toHaveBeenLastCalledWith(
      props.scope,
      props.editor,
      props.quest,
    );
  });
  describe('View in App', () => {
    test('enabled when quest published', () => {
      const { e } = setup({
        quest: { ...TEST_QUEST, published: Date.now() },
      });
      expect(e.find('#appview').prop('disabled') || false).toEqual(false);
    });

    test('not shown when quest not published', () => {
      const { e } = setup({
        quest: { ...TEST_QUEST, published: null },
      });
      expect(e.find('#appview')).toHaveLength(0);
    });
  });
});
