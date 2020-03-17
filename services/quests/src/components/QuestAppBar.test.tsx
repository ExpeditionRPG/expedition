import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import QuestAppBar, {Props} from './QuestAppBar';
import {defaultState as initialEditor} from '../reducers/Editor';
import {loggedOutUser} from 'shared/auth/UserState';
import {initialQuestState} from '../reducers/Quest';
configure({ adapter: new Adapter() });

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
    onMenuSelect: jasmine.createSpy('onMenuSelect'),
    onUserDialogRequest: jasmine.createSpy('onUserDialogRequest'),
    onViewError: jasmine.createSpy('onViewError'),
    playFromCursor: jasmine.createSpy('playFromCursor'),
    ...overrides,
  };
  const e = shallow(<QuestAppBar {...props} />);
  return {props, e};
}

describe('QuestAppBar', () => {
  test.skip('Shows user icon', () => { /* TODO */ });

  test.skip('Shows quest title', () => { /* TODO */ });

  test.skip('...test each toolbar button', () => { /* TODO */ });

  describe('View in App', () => {
    test('enabled when quest published', () => {
      const {e} = setup({
        quest: {...TEST_QUEST, published: Date.now()},
      } as any);
      expect(e.find('#appview').prop('disabled') || false).toEqual(false);
    });

    test('not shown when quest not published', () => {
      const {e} = setup({
        quest: {...TEST_QUEST, published: null},
      } as any);
      expect(e.find('#appview')).toHaveLength(0);
    });
  });
});
