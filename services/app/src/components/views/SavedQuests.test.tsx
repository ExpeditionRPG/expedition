import * as React from 'react';
import {render} from 'app/Testing';
import SavedQuests, {Props} from './SavedQuests';
import {TUTORIAL_QUESTS} from '../../Constants';

function setup(props: Partial<Props>) {
  const e = render(<SavedQuests {...(props as any as Props)} />);
  return {props, e};
}

const SAVED_QUEST = {details: TUTORIAL_QUESTS[0], ts: 123, pathLen: 5};
const OFFLINE_QUEST = {details: TUTORIAL_QUESTS[0], ts: 123, pathLen: 0};

describe('SavedQuests', () => {
  test('prompts the user when there are no saved quests', () => {
    const {e} = setup({
      saved: [],
    });
    expect(e.text()).toContain('You have no saved or offline quests.');
  });
  test('shows only saved quests if no offline quests', () => {
    const {e} = setup({
      saved: [SAVED_QUEST],
    });
    const text = e.find('.textDivider').text();
    expect(text).not.toContain('Offline');
    expect(text).toContain('Saved');
  });
  test('shows only offline quests if no saved quests', () => {
    const {e} = setup({
      saved: [OFFLINE_QUEST],
    });
    const text = e.find('.textDivider').text();
    expect(text).not.toContain('Saved');
    expect(text).toContain('Offline');
  });
  test('groups saves by quest and shows count', () => {
    const {e} = setup({
      saved: [SAVED_QUEST, SAVED_QUEST, SAVED_QUEST],
    });
    const text = e.text();
    expect(text).toContain('3 saves');
  });
});
