import {mount, unmountAll} from 'app/Testing';
import * as React from 'react';
import GMCorner, { Props } from './GMCorner';
import {initialSettings} from '../../reducers/Settings';
import {initialMultiplayer} from '../../reducers/Multiplayer';
import {loggedOutUser} from '../../reducers/User';
import {TUTORIAL_QUESTS} from '../../Constants';

describe('GMCorner', () => {
  afterEach(unmountAll);

  function setup(overrides?: Props) {
    const props: Props = {
      quests: TUTORIAL_QUESTS,
      settings: initialSettings,
      contentSets: new Set(['horror']),
      onQuestSelect: jasmine.createSpy('onQuestSelect'),
      onReturn: jasmine.createSpy('onReturn'),
      ...overrides,
    };
    const e = mount(<GMCorner {...props} />);
    return {e, props};
  }

describe('GMCorner', () => {
  test('quests matching configured contentsets are shown', () => {
    const {e} = setup();
    expect(e.html()).toContain('Horror');
  });
  test('quests not matching configured contentsets are hidden', () => {
    const {e} = setup({contentSets: new Set(['future'])});
    expect(e.html()).not.toContain('Horror');
  });
});
