import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { initialSettings } from 'app/reducers/Settings';
import { mount, unmountAll } from 'app/Testing';
import * as React from 'react';
import { Expansion } from 'shared/schema/Constants';
import { TUTORIAL_QUESTS } from '../../Constants';
import Resolve, { Props } from './Resolve';

const PERSONA_SUBSTR = 'resolve their persona';

describe('Combat Resolve', () => {
  afterEach(unmountAll);

  function setup(overrides?: Props) {
    const props: Props = {
      settings: initialSettings,
      mostRecentRolls: [],
      contentSets: new Set([Expansion.horror]),
      onNext: jest.fn(),
      onReturn: jest.fn(),
      ...overrides,
    };
    console.log(props);
    const e = mount(<Resolve {...props} />);
    return { e, props };
  }

  test('shows horror persona helper when horror contentset enabled', () => {
    const { e } = setup();
    expect(e.html()).toContain(PERSONA_SUBSTR);
  });
  test('hides horror persona helper when horror contentset disabled', () => {
    const { e } = setup({ contentSets: new Set() });
    expect(e.html()).not.toContain(PERSONA_SUBSTR);
  });
  test('shows rolls only when automatic rolling is enabled', () => {
    const { e } = setup({
      settings: { ...initialSettings, autoRoll: true },
      mostRecentRolls: [4, 12, 20],
    });
    expect(e.find('.roll').map(r => r.text())).toEqual(['4', '12', '20']);
    const hidden = setup({
      settings: { ...initialSettings, autoRoll: false },
      mostRecentRolls: [4, 12, 20],
    });
    expect(hidden.e.find('.roll')).toHaveLength(0);
  });
});
