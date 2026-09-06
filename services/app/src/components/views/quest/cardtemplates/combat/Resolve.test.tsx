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
  test.skip('shows rolls if enabled in settings', () => {
    /* TODO */
  });
});
