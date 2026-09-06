import { Quest as QuestSchema } from 'shared/schema/Quests';
import { ParserNode } from '../components/views/quest/cardtemplates/TemplateTypes';
import { initialQuestState, quest } from './Quest';
import { QuestState } from './StateTypes';

const cheerio = require('cheerio') as CheerioAPI;

// Reuse the context off the reducer's own initial node rather than importing
// cardtemplates/combat/Types directly: that module cycles back through
// actions/Settings into this reducer, and pulling it in first blows up with a
// temporal-dead-zone error on EMPTY_COMBAT_STATE.
const BASE_CONTEXT = initialQuestState.node.ctx;

function testQuest(fields: object): QuestSchema {
  return new QuestSchema({
    author: 'Test Author',
    id: 'test-id',
    partition: 'expedition-public',
    publishedurl: 'http://example.com/test',
    summary: 'A test quest',
    title: 'Test Quest',
    ...fields,
  });
}

function testNode(xml: string): ParserNode {
  return new ParserNode(cheerio.load(xml)('roleplay'), { ...BASE_CONTEXT });
}

const DETAILS = testQuest({ id: 'q1', title: 'Oust Albanus' });
const OTHER_DETAILS = testQuest({ id: 'q2', title: 'Mistress Malaise' });
const NODE = testNode('<roleplay id="first">Hello</roleplay>');
const OTHER_NODE = testNode('<roleplay id="second">Goodbye</roleplay>');

function playing(overrides?: Partial<QuestState>): QuestState {
  return {
    details: DETAILS,
    node: NODE,
    lastPlayed: new Date(1500000000000),
    savedTS: 1500000000000,
    ...overrides,
  };
}

describe('Quest reducer', () => {
  test('defaults to an empty quest with a placeholder node', () => {
    const state = quest(undefined, { type: '@@INIT' });
    expect(state.details.id).toEqual('');
    expect(state.details.title).toEqual('');
    expect(state.node).toBeInstanceOf(ParserNode);
    expect(state.lastPlayed).toBeNull();
    expect(state.savedTS).toBeNull();
  });

  test('ignores unknown actions', () => {
    const state = playing();
    expect(quest(state, { type: 'NOT_A_REAL_ACTION' })).toBe(state);
  });

  describe('QUEST_DETAILS', () => {
    test('swaps details and leaves the node alone', () => {
      const result = quest(playing(), {
        type: 'QUEST_DETAILS',
        details: OTHER_DETAILS,
      } as any);
      expect(result.details).toBe(OTHER_DETAILS);
      expect(result.node).toBe(NODE);
    });

    test('preserves lastPlayed and savedTS', () => {
      const state = playing();
      const result = quest(state, {
        type: 'QUEST_DETAILS',
        details: OTHER_DETAILS,
      } as any);
      expect(result.lastPlayed).toBe(state.lastPlayed);
      expect(result.savedTS).toEqual(state.savedTS);
    });
  });

  describe('QUEST_NODE', () => {
    test('advances the node and adopts the details when supplied', () => {
      const result = quest(playing(), {
        type: 'QUEST_NODE',
        node: OTHER_NODE,
        details: OTHER_DETAILS,
      } as any);
      expect(result.node).toBe(OTHER_NODE);
      expect(result.details).toBe(OTHER_DETAILS);
    });

    test('falls back to the existing details when the action omits them', () => {
      const result = quest(playing(), {
        type: 'QUEST_NODE',
        node: OTHER_NODE,
      } as any);
      expect(result.node).toBe(OTHER_NODE);
      expect(result.details).toBe(DETAILS);
    });

    test('does not reset lastPlayed or savedTS as the quest progresses', () => {
      const state = playing();
      const result = quest(state, {
        type: 'QUEST_NODE',
        node: OTHER_NODE,
      } as any);
      expect(result.lastPlayed).toBe(state.lastPlayed);
      expect(result.savedTS).toEqual(state.savedTS);
    });
  });

  describe('QUEST_EXIT', () => {
    test('clears the played quest back to the initial state', () => {
      const result = quest(playing(), { type: 'QUEST_EXIT' });
      expect(result.details).toBe(initialQuestState.details);
      expect(result.details.id).toEqual('');
      expect(result.node).toBe(initialQuestState.node);
      expect(result.lastPlayed).toBeNull();
      expect(result.savedTS).toBeNull();
    });

    test('does not mutate the shared initial state', () => {
      quest(playing(), { type: 'QUEST_EXIT' });
      expect(initialQuestState.details.id).toEqual('');
      expect(initialQuestState.lastPlayed).toBeNull();
      expect(initialQuestState.savedTS).toBeNull();
    });
  });

  describe('PREVIEW_QUEST', () => {
    test('sets details along with the saved and last-played metadata', () => {
      const lastPlayed = new Date(1600000000000);
      const result = quest(initialQuestState, {
        type: 'PREVIEW_QUEST',
        quest: DETAILS,
        lastPlayed,
        savedTS: 1600000000000,
      } as any);
      expect(result.details).toBe(DETAILS);
      expect(result.lastPlayed).toBe(lastPlayed);
      expect(result.savedTS).toEqual(1600000000000);
    });

    test('nulls out stale metadata when previewing a never-played quest', () => {
      const result = quest(playing(), {
        type: 'PREVIEW_QUEST',
        quest: OTHER_DETAILS,
      } as any);
      expect(result.details).toBe(OTHER_DETAILS);
      expect(result.lastPlayed).toBeNull();
      expect(result.savedTS).toBeNull();
    });

    test('leaves the node in place', () => {
      const result = quest(playing(), {
        type: 'PREVIEW_QUEST',
        quest: OTHER_DETAILS,
      } as any);
      expect(result.node).toBe(NODE);
    });
  });
});
