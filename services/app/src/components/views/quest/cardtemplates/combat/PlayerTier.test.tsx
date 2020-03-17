import {mount, unmountAll} from 'app/Testing';
import * as React from 'react';
import PlayerTier, { Props } from './PlayerTier';
import {initialSettings} from 'app/reducers/Settings';
import {Expansion} from 'shared/schema/Constants';

describe('PlayerTier', () => {
  afterEach(unmountAll);

  function setup(overrides?: Props) {
    const props: Props = {
      settings: initialSettings,
      adventurers: 3,
      combat: {
        mostRecentAttack: {damage: 3},
        roundCount: 2,
      },
      maxTier: 0,
      numAliveAdventurers: 3,
      localAliveAdventurers: 2,
      seed: 'asdf',
      tier: 0,
      contentSets: new Set(),
      onAdventurerDelta: jasmine.createSpy('onAdventurerDelta'),
      onDecisionSetup: jasmine.createSpy('onDecisionSetup'),
      onDefeat: jasmine.createSpy('onDefeat'),
      onNext: jasmine.createSpy('onNext'),
      onTierSumDelta: jasmine.createSpy('onTierSumDelta'),
      onVictory: jasmine.createSpy('onVictory'),
      ...overrides,
    } as any;
    const e = mount(<PlayerTier {...props} />);
    return {e, props};
  }


  describe('Combat PlayerTier', () => {
    test.skip('starts at current player and tier count', () => { /* TODO */ });
    test('shows total alive player count along with local alive player count', () => {
      const {e} = setup();
      const text = e.find("Picker#adventurers").text();
      expect(text).toContain('Adventurers: 2');
      expect(text).toContain('3 across all devices');
    });
    test('shows persona instructions when injured and horror contentset enabled', () => {
      const {e} = setup({
        adventurers: 3,
        localAliveAdventurers: 2,
        contentSets: new Set([Expansion.horror]),
      } as any);
      expect(e.text()).toContain('reset your persona');
    });
  });
});
