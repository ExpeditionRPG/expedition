import { shallow } from 'enzyme';
import * as React from 'react';
import { loggedOutUser } from 'shared/auth/UserState';
import { defaultState as initialEditor } from '../reducers/Editor';
import { initialQuestState } from '../reducers/Quest';

import QuestAppBar, { Props } from './QuestAppBar';
const TEST_QUEST = {
  ...initialQuestState,
  title: 'Example Quest',
};

function setup(overrides: Partial<Props>) {
  const props: Props = {
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
  test.skip('Shows user icon', () => {
    /* TODO */
  });

  test.skip('Shows quest title', () => {
    /* TODO */
  });

  test.skip('...test each toolbar button', () => {
    /* TODO */
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
