import {mount, unmountAll} from 'app/Testing';
import * as React from 'react';
import QuestSetup, { Props } from './QuestSetup';
import {initialSettings} from 'app/reducers/Settings';
import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {loggedOutUser} from 'shared/auth/UserState';
import {TUTORIAL_QUESTS} from 'app/Constants';

const PERSONA_SUBSTR1 = 'Draw a persona card';
const PERSONA_SUBSTR2 = 'Draw an additional Influence';

describe('QuestSetup', () => {
  afterEach(unmountAll);

  function setup(overrides?: Props) {
    const props: Props = {
      quests: TUTORIAL_QUESTS,
      settings: initialSettings,
      contentSets: new Set(['horror']),
      onQuestSelect: jasmine.createSpy('onQuestSelect'),
      onCustomCombatSelect: jasmine.createSpy('onCustomCombatSelect'),
      onReturn: jasmine.createSpy('onReturn'),
      ...overrides,
    };
    const e = mount(<QuestSetup {...props} />);
    return {e, props};
  }

  test('shows persona and influence instructions when horror contentset enabled', () => {
    const html = setup().e.html();
    expect(html).toContain(PERSONA_SUBSTR1);
    expect(html).toContain(PERSONA_SUBSTR2);
  });

  test('hides persona and influence instructions when horror contentset disabled', () => {
    const html = setup({contentSets: new Set()}).e.html();
    expect(html).not.toContain(PERSONA_SUBSTR1);
    expect(html).not.toContain(PERSONA_SUBSTR2);
  });
});
