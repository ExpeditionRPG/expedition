import { loggedOutUser } from 'shared/auth/UserState';
import { defaultContext } from '../components/views/quest/cardtemplates/Template';
import { ParserNode } from '../components/views/quest/cardtemplates/TemplateTypes';
import { AUTH_SETTINGS } from '../Constants';
import { fakeConnection } from '../multiplayer/Testing';
import { initialMultiplayer } from '../reducers/Multiplayer';
import { initialQuestState } from '../reducers/Quest';
import { initialSettings } from '../reducers/Settings';
import { Action } from '../Testing';
import { endQuest, event, exitQuest, initQuest, loadNode } from './Quest';

import * as cheerio from 'shared/Cheerio';
const fetchMock = require('fetch-mock');

describe('Quest actions', () => {
  describe('initQuest', () => {
    test('successfully returns the parsed quest node', () => {
      const questNode = cheerio.load(
        '<quest><roleplay><p>Hello</p></roleplay></quest>',
      )('quest');
      const result = initQuest(
        initialQuestState.details,
        questNode,
        defaultContext(),
      );
      expect(result.node.getRootElem().toString()).toEqual(
        '<quest><roleplay><p>Hello</p></roleplay></quest>',
      );
    });
  });

  describe('event', () => {
    test.each(['win', 'lose'])('handles %s event', evt => {
      const node = new ParserNode(
        cheerio.load(
          '<quest><combat><event on="win"><roleplay>Won</roleplay></event><event on="lose"><roleplay>Lost</roleplay></event></combat></quest>',
        )('combat'),
        defaultContext(),
      );
      const actions = Action(event, { quest: { node } }).execute({ evt });
      const next = actions.find(action => action.type === 'QUEST_NODE').node;
      expect(next.getTag()).toBe('roleplay');
      expect(next.elem.text()).toBe(evt === 'win' ? 'Won' : 'Lost');
    });
    test('reports invalid event with node debug information', () => {
      const node = new ParserNode(
        cheerio.load('<combat></combat>')('combat'),
        defaultContext(),
      );
      expect(() =>
        Action(event, { quest: { node } }).execute({ evt: 'invalid' }),
      ).toThrow(/Could not get next node for event "invalid"/);
    });
  });
  describe('loadNode', () => {
    test('ends quest on end trigger', () => {
      const node = new ParserNode(
        cheerio.load('<trigger>end</trigger>')('trigger'),
        defaultContext(),
      );
      const actions = Action(loadNode, {}).execute(node);
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: 'NAVIGATE',
          to: expect.objectContaining({ name: 'QUEST_END' }),
        }),
      );
    });
    test.each(['roleplay', 'combat'])('dispatches %s template', tag => {
      const node = new ParserNode(
        cheerio.load('<' + tag + '><p>Ready</p></' + tag + '>')(tag),
        defaultContext(),
      );
      const actions = Action(loadNode, {
        settings: initialSettings,
        quest: { node },
      }).execute(node);
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: 'QUEST_NODE',
          node: expect.any(ParserNode),
        }),
      );
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: 'NAVIGATE',
          to: expect.objectContaining({ name: 'QUEST_CARD' }),
        }),
      );
    });
  });

  describe('endQuest', () => {
    afterEach(() => {
      fetchMock.restore();
    });

    test('Logs the end of the quest to analytics', () => {
      const matcher = AUTH_SETTINGS.URL_BASE + '/analytics/quest/end';
      fetchMock.post(matcher, {});
      Action(endQuest, {
        user: loggedOutUser,
        settings: initialSettings,
        quest: { details: initialQuestState },
      }).execute({});
      expect(fetchMock.called(matcher)).toEqual(true);
    });
  });

  describe('exitQuest', () => {
    test('clears waitingOn', () => {
      const c = fakeConnection();
      const a = Action(
        exitQuest,
        {
          multiplayer: {
            ...initialMultiplayer,
            connected: true,
            client: 'abc',
            instance: 'def',
          },
        },
        c,
      ).execute();
      expect(c.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'STATUS', waitingOn: undefined }),
        undefined,
      );
    });
  });
});
