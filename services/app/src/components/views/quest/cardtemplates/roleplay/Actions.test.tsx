import {DifficultyType, FontSizeType} from 'app/reducers/StateTypes';
import {Action} from 'app/Testing';
import {
  handleResolvePhase,
  initCombat,
} from '../combat/Actions';
import {midCombatChoice} from '../roleplay/Actions';
import {defaultContext} from '../Template';
import {ParserNode} from '../TemplateTypes';
import {CombatPhase} from '../combat/Types';

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
  numLocalPlayers: 3,
  showHelp: true,
  simulator: false,
  timerSeconds: 10,
  vibration: true,
};

describe('Roleplay actions', () => {
  describe('midCombatChoice', () => {
    // Setup combat state where we've initialized combat and just finished a timed round.
    const newMidCombatNode = () => {
      let baseNode = new ParserNode(cheerio.load(`<quest>
        <roleplay>Text</roleplay>
        <combat id="c1">
          <e>Test</e>
          <event on="win"><roleplay id="wincard">win card</roleplay></event>
          <event on="lose"><roleplay>lose card</roleplay></event>
          <event on="round"><roleplay>
            <choice><trigger>win</trigger></choice>
            <choice><trigger>lose</trigger></choice>
            <choice><trigger>end</trigger></choice>
            <choice><roleplay id="rp2">rp2</roleplay></choice>
            <choice><trigger>goto outside</trigger></choice>
            <choice><trigger>goto rp2</trigger></choice>
            <choice><trigger>goto wincard</trigger></choice>
          </roleplay></event>
        </combat>
        <roleplay id="outside">Outside Roleplay</roleplay>
      </quest>`)('#c1'), defaultContext());
      baseNode = Action(initCombat as any).execute({node: baseNode, settings: TEST_SETTINGS})[1].node;
      baseNode = Action(handleResolvePhase).execute({node: baseNode})[1].node;
      return baseNode.clone();
    };

    test('goes to win screen on **win**', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 0, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual(CombatPhase.victory);
    });

    test('goes to lose screen on **lose**', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 1, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual(CombatPhase.defeat);
    });

    test('ends quest on **end** and zeros audio', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 2, maxTier: 0, seed: ''});
      expect(actions[1].to.name).toEqual('QUEST_END');
      expect(actions[2].type).toEqual('AUDIO_SET');
    });

    test('goes to next round when pnode.getNext() falls outside of combat scope', () => {
      const rp2 = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 3, maxTier: 0, seed: ''})[1].node;
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: rp2, index: 0, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual('RESOLVE_ABILITIES');
    });

    test('handles gotos that point to outside of combat and zeros audio', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 4, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual('ROLEPLAY');
      expect(actions[1].node.elem.text()).toEqual('Outside Roleplay');
      expect(actions[3].type).toEqual('AUDIO_SET');
    });

    test('handles GOTOs that point to other roleplaying inside of the same combat', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 5, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual(CombatPhase.midCombatRoleplay);
      expect(actions[1].node.elem.text()).toEqual('rp2');
    });

    test('renders as combat for RPs inside of same combat', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 3, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual(CombatPhase.midCombatRoleplay);
    });

    test('renders as roleplay upon goto to element inside of win/lose event and zeros audio', () => {
      const actions = Action(midCombatChoice).execute({settings: TEST_SETTINGS, node: newMidCombatNode(), index: 6, maxTier: 0, seed: ''});
      expect(actions[2].to.phase).toEqual('ROLEPLAY');
      expect(actions[3].type).toEqual('AUDIO_SET');
    });
  });
});
