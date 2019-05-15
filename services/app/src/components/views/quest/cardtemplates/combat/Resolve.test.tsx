import {mount, unmountAll} from 'app/Testing';
import * as React from 'react';
import Resolve, { Props } from './Resolve';
import {initialSettings} from 'app/reducers/Settings';
import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {TUTORIAL_QUESTS} from '../../Constants';
import {Expansion} from 'shared/schema/Constants';

const PERSONA_SUBSTR = 'resolve their persona';

describe('Combat Resolve', () => {
  afterEach(unmountAll);

  function setup(overrides?: Props) {
    const props: Props = {
      settings: initialSettings,
      mostRecentRolls: [],
      contentSets: new Set(Expansion.horror]),
      onNext: jasmine.createSpy('onNext'),
      onReturn: jasmine.createSpy('onReturn'),
      ...overrides,
    };
    console.log(props);
    const e = mount(<Resolve {...props} />);
    return {e, props};
  }

  test('shows horror persona helper when horror contentset enabled', () => {
    const {e} = setup();
    expect(e.html()).toContain(PERSONA_SUBSTR);
  });
  test('hides horror persona helper when horror contentset disabled', () => {
    const {e} = setup({contentSets: new Set()});
    expect(e.html()).not.toContain(PERSONA_SUBSTR);
  });
  test.skip('shows rolls if enabled in settings', () => { /* TODO */ });
});
