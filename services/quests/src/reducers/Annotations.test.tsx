import { annotations } from './Annotations';
test('maps warnings/errors with one details hint per line, preserves logs, and resets playtest', () => {
  const msgs = {
    info: [{ type: 'info', text: 'ignored', url: '1', line: 0 }],
    warning: [{ type: 'warning', text: 'warn', url: '2', line: 4 }],
    error: [],
    internal: [{ type: 'internal', text: 'bug', url: '3', line: 4 }],
  };
  const original = JSON.parse(JSON.stringify(msgs));
  const state = annotations(undefined, {
    type: 'PLAYTEST_MESSAGE',
    msgs,
  } as any);
  expect(state.playtest).toEqual([
    { column: 0, row: 4, text: 'Warning 2: warn', type: 'warning' },
    { column: 0, row: 4, text: 'Error 3: PLEASE REPORT: bug', type: 'error' },
    { column: 0, row: 4, text: '(Click the icon for details)', type: 'info' },
  ]);
  expect(msgs).toEqual(original);
  expect(annotations(state, { type: 'PLAYTEST_INIT' }).playtest).toEqual([]);
  const rendered = annotations(state, { type: 'QUEST_RENDER', msgs } as any);
  expect(rendered.spellcheck).toEqual(state.playtest);
  expect(rendered.playtest).toBe(state.playtest);
});
