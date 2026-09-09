import { tutorial } from './Tutorial';
test('hides play-from-cursor guidance when preview is rebooted', () => {
  const state = tutorial(undefined, { type: 'INIT' });
  expect(state.playFromCursor).toBe(true);
  expect(tutorial(state, { type: 'REBOOT_APP' }).playFromCursor).toBe(false);
  expect(state.playFromCursor).toBe(true);
});
