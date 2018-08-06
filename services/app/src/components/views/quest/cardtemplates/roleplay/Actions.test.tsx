import {DifficultyType, FontSizeType} from 'app/reducers/StateTypes';
import {Action} from 'app/Testing';
import {
  handleResolvePhase,
  initCombat,
} from '../combat/Actions';
import {midCombatChoice} from '../roleplay/Actions';
import {defaultContext} from '../Template';
import {ParserNode} from '../TemplateTypes';

const cheerio = require('cheerio');

const TEST_SETTINGS = {
  audioEnabled: false,
  autoRoll: false,
  contentSets: {
    horror: false,
  },
  difficulty: 'NORMAL' as DifficultyType,
  experimental: false,
  fontSize: 'NORMAL' as FontSizeType,
  multitouch: true,
  numPlayers: 3,
  showHelp: true,
  simulator: false,
  timerSeconds: 10,
  vibration: true,
};

describe('Roleplay actions', () => {
  // Almost entirely glue code; no testing needed right now.

  describe('midCombatChoice', () => {
    // Setup combat state where we've initialized combat and just finished a timed round.
    const newMidCombatNode = () => {
      let baseNode = new ParserNode(cheerio.load(`<quest>
        <roleplay>Text</roleplay>
        <combat id="c1">
          <e>Test</e>
          <event on="win"><roleplay>win card</roleplay></event>
          <event on="lose"><roleplay>lose card</roleplay></event>
          <event on="round"><roleplay>
            <choice><trigger>win</trigger></choice>
            <choice><trigger>lose</trigger></choice>
            <choice><trigger>end</trigger></choice>
            <choice><roleplay id="rp2">rp2</roleplay></choice>
            <choice><trigger>goto outside</trigger></choice>
            <choice><trigger>goto rp2</trigger></choice>
          </roleplay></event>
        </combat>
        <roleplay id="outside">Outside Roleplay</roleplay>
      </quest>`)('#c1'), defaultContext());
      baseNode = Action(initCombat as any).execute({node: baseNode, settings: TEST_SETTINGS})[1].node;
      baseNode = Action(handleResolvePhase).execute({node: baseNode})[0].node;
      return baseNode.clone();
    };

    it('goes to win screen on **win**', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 0, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual('VICTORY');
    });

    it('goes to lose screen on **lose**', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 1, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual('DEFEAT');
    });

    it('ends quest on **end**', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 2, maxTier: 0, seed: ''});
      expect(actions[1].to.name).toEqual('QUEST_END');
    });

    it('goes to next round when pnode.getNext() falls outside of combat scope', () => {
      const rp2 = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 3, maxTier: 0, seed: ''})[1].node;
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: rp2, index: 0, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual('RESOLVE_ABILITIES');
    });

    it('handles gotos that point to outside of combat', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 4, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual('ROLEPLAY');
      expect(actions[1].node.elem.text()).toEqual('Outside Roleplay');
    });

    it('handles GOTOs that point to other roleplaying inside of the same combat', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 5, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual('MID_COMBAT_ROLEPLAY');
      expect(actions[1].node.elem.text()).toEqual('rp2');
    });

    it('renders as combat for RPs inside of same combat', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 3, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual('MID_COMBAT_ROLEPLAY');
    });
  });
});
