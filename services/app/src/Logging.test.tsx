import { setGA } from './Globals';
import { logEvent } from './Logging';

describe('Console buffer', () => {
  function setup() {
    let logging: typeof import('./Logging');
    jest.isolateModules(() => {
      logging = require('./Logging');
    });
    const original = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const console = { ...original };
    logging.setupLogging(console);
    return { logging, console, original };
  }
  test('logs the start of console and the most recent event', () => {
    const { logging, console, original } = setup();
    console.log('startup');
    console.warn('warning', { count: 2 });
    console.error(null, undefined);
    expect(logging.getLogBuffer()).toEqual([
      'startup',
      'warning {"count":2}',
      'null undefined',
    ]);
    expect(original.warn).toHaveBeenCalledWith('warning', { count: 2 });
  });
  test('omits only middle logs after filling both buffers', () => {
    const { logging, console } = setup();
    for (let i = 0; i < 100; i++) {
      console.log('line ' + i);
    }
    expect(logging.getLogBuffer()).toEqual([
      ...Array.from({ length: 25 }, (_, i) => 'line ' + i),
      '<<<<<<25 LOGS OMITTED>>>>>>>',
      ...Array.from({ length: 50 }, (_, i) => 'line ' + (i + 50)),
    ]);
  });
  test('supports empty console calls and many mixed arguments', () => {
    const { logging, console, original } = setup();
    console.log();
    console.log('text', 0, false, null, undefined, [1, 2]);
    expect(logging.getLogBuffer()).toEqual([
      '',
      'text 0 false null undefined 1,2',
    ]);
    expect(original.log).toHaveBeenLastCalledWith(
      'text',
      0,
      false,
      null,
      undefined,
      [1, 2],
    );
  });
});
describe('logEvent', () => {
  afterEach(() => setGA(null));
  test('logs supported analytics fields and omits extra arguments', () => {
    const ga = { event: jest.fn() };
    setGA(ga as any);
    logEvent('category', 'action', {
      label: 'quest',
      value: 0,
      extra: 'ignored',
    });
    expect(ga.event).toHaveBeenCalledWith({
      category: 'category',
      action: 'action',
      label: 'quest',
      value: 0,
    });
  });
  test('accepts missing optional analytics arguments', () => {
    const ga = { event: jest.fn() };
    setGA(ga as any);
    logEvent('category', 'action');
    expect(ga.event).toHaveBeenCalledWith({
      category: 'category',
      action: 'action',
      label: '',
      value: undefined,
    });
  });
  test('does not break when GA not set up', () => {
    setGA(null);
    expect(() => logEvent('category', 'action', {})).not.toThrow();
  });
});
