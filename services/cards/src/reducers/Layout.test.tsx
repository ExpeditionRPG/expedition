import Layout, { initialState } from './Layout';

describe('Layout reducer', () => {
  test('is not printing when given undefined', () => {
    expect(Layout(undefined, { type: '@@INIT' })).toEqual({ printing: false });
  });

  test('starts printing on LAYOUT_PRINTING', () => {
    expect(
      Layout({ printing: false }, {
        type: 'LAYOUT_PRINTING',
        printing: true,
      } as any),
    ).toEqual({ printing: true });
  });

  test('stops printing on LAYOUT_PRINTING', () => {
    expect(
      Layout({ printing: true }, {
        type: 'LAYOUT_PRINTING',
        printing: false,
      } as any),
    ).toEqual({ printing: false });
  });

  test('does not mutate the state it was given', () => {
    const state = { printing: false };
    const result = Layout(state, {
      type: 'LAYOUT_PRINTING',
      printing: true,
    } as any);
    expect(state).toEqual({ printing: false });
    expect(result).not.toBe(state);
  });

  test('leaves the exported initial state alone', () => {
    Layout(undefined, { type: 'LAYOUT_PRINTING', printing: true } as any);
    expect(initialState).toEqual({ printing: false });
  });

  test('returns the same state object for unhandled actions', () => {
    const state = { printing: true };
    expect(Layout(state, { type: 'NOT_A_LAYOUT_ACTION' })).toBe(state);
  });
});
