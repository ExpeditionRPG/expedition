import { generateSeed } from 'shared/parse/Context';
import { loggedOutUser } from 'shared/auth/UserState';
import * as cheerio from 'shared/Cheerio';
import * as requests from 'shared/requests';
import { defaultContext } from '../components/views/quest/cardtemplates/Template';
import { ParserNode } from '../components/views/quest/cardtemplates/TemplateTypes';
import { initialQuestState } from '../reducers/Quest';
import { initialSettings } from '../reducers/Settings';
import { initialSearch } from '../reducers/Search';
import { newMockStore } from '../Testing';
import { searchInternal } from './Search';
import {
  fetchQuestXML,
  loadQuestXML,
  subscribe,
  submitUserFeedback,
} from './Web';

jest.mock('shared/requests', () => ({
  ...jest.requireActual('shared/requests'),
  fetchLocal: jest.fn(),
}));
const fetchMock = require('fetch-mock');
afterEach(() => fetchMock.restore());
const xml = '<quest><roleplay data-line="42">Hello</roleplay></quest>';

function store() {
  const result = newMockStore({});
  (result as any).multiplayerClient.sendEvent = jest.fn();
  return result;
}
describe('fetchQuestXML', () => {
  test('shows snackbar on request error without dispatching a quest', async () => {
    (requests.fetchLocal as jest.Mock).mockRejectedValue(new Error('offline'));
    const s = store();
    await (s.dispatch as any)(
      fetchQuestXML({ details: { publishedurl: 'url' } as any }),
    );
    expect(s.getActions()).toContainEqual(
      expect.objectContaining({
        type: 'SNACKBAR_OPEN',
        message: expect.stringContaining('Network error'),
      }),
    );
    expect(s.getActions().some(action => action.type === 'QUEST_NODE')).toBe(
      false,
    );
  });
  test('dispatches loaded quest before resolving and broadcasts its generated seed', async () => {
    let resolve: (value: string) => void;
    (requests.fetchLocal as jest.Mock).mockReturnValue(
      new Promise<string>(r => {
        resolve = r;
      }),
    );
    const s = store();
    const promise = (s.dispatch as any)(
      fetchQuestXML({ details: { publishedurl: 'url' } as any }),
    );
    expect(s.getActions()).toEqual([]);
    const outbound = JSON.parse(
      (s as any).multiplayerClient.sendEvent.mock.calls[0][0].args,
    );
    expect(outbound.seed).toEqual(expect.any(String));
    expect(outbound.seed.length).toBeGreaterThan(0);
    resolve(xml);
    await promise;
    const node = s
      .getActions()
      .find(action => action.type === 'QUEST_NODE').node;
    expect(node.elem.text()).toBe('Hello');
    expect(node.ctx.seed).toBe(generateSeed(outbound.seed));
    expect(requests.fetchLocal).toHaveBeenCalledWith('url');
  });
  test('preserves supplied seed both locally and for multiplayer replay', async () => {
    (requests.fetchLocal as jest.Mock).mockResolvedValue(xml);
    const s = store();
    await (s.dispatch as any)(
      fetchQuestXML({
        details: { publishedurl: 'url' } as any,
        seed: 'shared-seed',
      }),
    );
    expect(
      s.getActions().find(action => action.type === 'QUEST_NODE').node.ctx.seed,
    ).toBe(generateSeed('shared-seed'));
    const outbound = JSON.parse(
      (s as any).multiplayerClient.sendEvent.mock.calls[0][0].args,
    );
    expect(outbound.seed).toBe('shared-seed');
  });
});
test('loadQuestXML logs quest play after initializing the quest', () => {
  fetchMock.post('end:/analytics/quest/start', {});
  const s = newMockStore({
    user: loggedOutUser,
    settings: initialSettings,
    quest: initialQuestState,
  });
  s.dispatch(
    loadQuestXML({
      details: initialQuestState.details,
      questNode: cheerio.load(xml)('quest'),
      ctx: defaultContext(),
    }),
  );
  expect(s.getActions()[0].type).toBe('QUEST_NODE');
  expect(fetchMock.called('end:/analytics/quest/start')).toBe(true);
});
describe('search (now owned by Search actions)', () => {
  test.each([false, true])(
    'dispatches response or error for failed=%s',
    async failed => {
      const s = store();
      const fetchResults = failed
        ? jest.fn().mockRejectedValue(new Error('offline'))
        : jest.fn().mockResolvedValue({ quests: [], error: null });
      await searchInternal(
        { params: initialSearch.params, players: 2, settings: initialSettings },
        s.dispatch,
        fetchResults,
      ).promise;
      expect(s.getActions()).toContainEqual(
        expect.objectContaining({
          type: failed ? 'SEARCH_ERROR' : 'SEARCH_RESPONSE',
        }),
      );
      expect(
        s.getActions().some(action => action.type === 'SNACKBAR_OPEN'),
      ).toBe(failed);
    },
  );
});
test('subscribe shows request error', async () => {
  fetchMock.post('end:/user/subscribe', 500);
  const s = store();
  s.dispatch(subscribe({ email: 'test@example.com' }));
  await fetchMock.flush(true);
  expect(s.getActions()).toContainEqual(
    expect.objectContaining({ type: 'SNACKBAR_OPEN', actionLabel: 'Report' }),
  );
});
describe('submitUserFeedback', () => {
  function args() {
    return {
      quest: {
        ...initialQuestState,
        node: new ParserNode(cheerio.load(xml)('roleplay'), defaultContext()),
      },
      settings: initialSettings,
      user: loggedOutUser,
      type: 'BUG' as any,
      anonymous: true,
      text: 'A detailed description of the issue',
      rating: null,
    };
  }
  test('shows request error', async () => {
    fetchMock.post('end:/quest/feedback/BUG', 500);
    const s = store();
    await s.dispatch(submitUserFeedback(args()));
    expect(s.getActions()).toContainEqual(
      expect.objectContaining({ type: 'SNACKBAR_OPEN', actionLabel: 'Report' }),
    );
  });
  test('acknowledges submission and includes the current quest line', async () => {
    fetchMock.post('end:/quest/feedback/BUG', 'ok');
    const s = store();
    const feedback = args();
    await s.dispatch(submitUserFeedback(feedback));
    expect(s.getActions()).toContainEqual(
      expect.objectContaining({
        type: 'SNACKBAR_OPEN',
        message: 'Submission successful. Thank you!',
      }),
    );
    expect(JSON.parse(fetchMock.lastOptions().body)).toEqual(
      expect.objectContaining({
        questline: 42,
        text: feedback.text,
        anonymous: true,
      }),
    );
    // Form state is local to DialogsContainer; submitting must not mutate the
    // caller's object (the dialog clears/closes it through its own lifecycle).
    expect(feedback.text).toBe('A detailed description of the issue');
  });
});
