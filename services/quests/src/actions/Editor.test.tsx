jest.mock('app/actions/Quest', () => ({
  loadNode: jest.fn(() => ({ type: 'LOAD_TEST_NODE' })),
}));
jest.mock('app/actions/Settings', () => ({
  changeSettings: jest.fn(settings => ({ type: 'TEST_SETTINGS', settings })),
}));
import * as cheerio from 'shared/Cheerio';
import { renderXML } from 'shared/render/QDLParser';
import { loadNode } from 'app/actions/Quest';
import {
  getPlayNode,
  setDirty,
  lineNumbersToggle,
  renderAndPlay,
  updateDirtyState,
} from './Editor';
import { store } from '../Store';

describe('Editor actions', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });
  test('creates dirty and line-number view actions', () => {
    expect(setDirty(true)).toEqual({ type: 'SET_DIRTY', isDirty: true });
    expect(setDirty(false)).toEqual({ type: 'SET_DIRTY', isDirty: false });
    expect(lineNumbersToggle()).toEqual({ type: 'LINE_NUMBERS_TOGGLE' });
  });
  test.each(['roleplay', 'combat', 'decision'])(
    'accepts %s nodes and unwraps quest root',
    tag => {
      const root = cheerio.load(
        '<quest><' + tag + '>Text</' + tag + '></quest>',
      )('quest');
      expect(getPlayNode(root)?.get(0)).toBe(root.children().get(0));
      expect(getPlayNode(root.children())).toEqual(root.children());
    },
  );
  test('rejects invalid, empty and out-of-document cursor positions', () => {
    expect(getPlayNode(cheerio.load('<quest></quest>')('quest'))).toBeNull();
    expect(getPlayNode(cheerio.load('<p>invalid</p>')('p'))).toBeNull();
    expect(
      getPlayNode(renderXML('# Quest\n\nHello.').getResultAt(100)),
    ).toBeNull();
  });
  test('renders and starts the preview and automatic playtest with expansion settings', () => {
    const worker = {
      postMessage: jest.fn(),
      terminate: jest.fn(),
      onmessage: null,
      onerror: null,
    };
    const previous = window.Worker;
    (window as any).Worker = jest.fn(() => worker);
    const actions: any[] = [];
    const dispatch: any = (a: any) =>
      typeof a === 'function' ? a(dispatch) : actions.push(a);
    const oldWorker = { terminate: jest.fn() };
    try {
      renderAndPlay(
        { id: 'q', title: 'Quest', minplayers: 2, expansionhorror: true },
        '# Quest\n\n_Opening_\n\nHello.\n\n**end**',
        2,
        oldWorker as any,
      )(dispatch);
      expect(actions).toEqual([]);
      jest.runOnlyPendingTimers();
      expect(actions.map(a => a.type)).toEqual([
        'QUEST_RENDER',
        'REBOOT_APP',
        'TEST_SETTINGS',
        'LOAD_TEST_NODE',
        'PLAYTEST_INIT',
      ]);
      expect(loadNode).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ id: 'q', minplayers: 2 }),
      );
      expect(actions[2].settings).toEqual(
        expect.objectContaining({
          simulator: true,
          numLocalPlayers: 2,
          audioEnabled: false,
        }),
      );
      expect(oldWorker.terminate).toHaveBeenCalledTimes(1);
      expect(worker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RUN',
          xml: expect.stringContaining('<quest'),
          settings: expect.objectContaining({ expansionhorror: true }),
        }),
      );
    } finally {
      (window as any).Worker = previous;
    }
  });
  test('reports invalid cursor without rebooting or playing', () => {
    const dispatch = jest.fn();
    renderAndPlay({}, '# Quest\n\nHello.', 100, null)(dispatch);
    jest.runOnlyPendingTimers();
    expect(dispatch.mock.calls.map(c => c[0].type)).toEqual([
      'QUEST_RENDER',
      'PUSH_ERROR',
    ]);
    expect(dispatch.mock.calls[1][0].error.message).toContain(
      'Invalid cursor position',
    );
  });
  test('debounces autosave using editor state and cancels the previous timer', () => {
    const old = setTimeout(jest.fn(), 2000);
    const state: any = {
      editor: { dirty: true, dirtyTimeout: old },
      quest: {},
    };
    jest.spyOn(store, 'getState').mockReturnValue(state);
    const clear = jest.spyOn(globalThis, 'clearTimeout');
    const dispatch = jest.fn();
    updateDirtyState()(dispatch);
    expect(clear).toHaveBeenCalledWith(old);
    expect(dispatch.mock.calls.map(c => c[0].type)).toEqual([
      'SET_DIRTY_TIMEOUT',
    ]);
  });
});
