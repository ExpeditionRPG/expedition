import { TUTORIAL_QUESTS } from 'app/Constants';
import { initialSettings } from 'app/reducers/Settings';
import { render } from 'app/Testing';
import * as React from 'react';
import { Provider } from 'react-redux';
import { loggedOutUser } from 'shared/auth/UserState';
import QuestHistory, { Props } from './QuestHistory';

describe('QuestHistory', () => {
  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      played: {},
      onSelect: jest.fn(),
      onReturn: jest.fn(),
      ...overrides,
    };
    const e = render(<QuestHistory {...((props as any) as Props)} />);
    return { props, e };
  }

  test('informs user when no played quests', () => {
    const text = setup().e.text();
    expect(text).toContain("You haven't played any quests yet");
  });

  test('displays played quests', () => {
    const { e } = setup({
      played: {
        [TUTORIAL_QUESTS[0].id]: {
          details: TUTORIAL_QUESTS[0],
          lastPlayed: new Date(),
        },
      },
    });
    expect(e.text()).toContain(TUTORIAL_QUESTS[0].title);
  });
});
