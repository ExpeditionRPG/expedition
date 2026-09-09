jest.mock('app/actions/Search', () => ({ fetchSearchResults: jest.fn() }));
jest.mock('react-dom', () => ({
  render: jest.fn(),
  unmountComponentAtNode: jest.fn(),
}));
import { fetchSearchResults } from 'app/actions/Search';
import * as ReactDOM from 'react-dom';
test('runs at most ten crawls in parallel and fills worker slots after completion or failure', async () => {
  jest.useFakeTimers();
  const quests = Array.from({ length: 12 }, (_, i) => ({
    id: String(i + 1),
    title: 'Quest ' + i,
    publishedurl: 'https://example.com/' + i,
  }));
  (fetchSearchResults as jest.Mock).mockResolvedValue({ quests });
  const oldFetch = globalThis.fetch;
  const fetch = jest.fn().mockResolvedValue({
    text: () =>
      Promise.resolve(
        '<quest><roleplay data-line="0">Hello</roleplay></quest>',
      ),
  } as any);
  globalThis.fetch = fetch;
  const workers: any[] = [];
  const previous = window.Worker;
  (window as any).Worker = jest.fn(() => {
    const worker = {
      postMessage: jest.fn(),
      terminate: jest.fn(),
      onmessage: null,
      onerror: null,
    };
    workers.push(worker);
    return worker;
  });
  const base = document.createElement('div');
  base.id = 'react-app';
  document.body.appendChild(base);
  try {
    require('./Runner');
    jest.advanceTimersByTime(1000);
    for (let i = 0; i < 30; i++) await Promise.resolve();
    expect(fetchSearchResults).toHaveBeenCalledWith({});
    expect(fetch).toHaveBeenCalledTimes(12);
    expect(workers).toHaveLength(10);
    expect(workers[0].postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RUN',
        xml: expect.stringContaining('<quest'),
      }),
    );
    workers[0].onmessage({ data: { status: 'COMPLETE', ms: 12, lines: 1 } });
    expect(workers).toHaveLength(11);
    workers[1].onerror({ error: new Error('Worker failed') });
    expect(workers).toHaveLength(12);
    expect(workers[1].terminate).toHaveBeenCalledTimes(1);
    const store = (ReactDOM.render as jest.Mock).mock.calls[0][0].props.store;
    expect(store.getState()['1']).toEqual(
      expect.objectContaining({
        complete: true,
        runtimeMillis: 12,
        runtimeLines: 1,
      }),
    );
    expect(store.getState()['2']).toEqual(
      expect.objectContaining({
        complete: true,
        messages: [expect.any(Error)],
      }),
    );
  } finally {
    globalThis.fetch = oldFetch;
    (window as any).Worker = previous;
    base.remove();
    jest.clearAllTimers();
    jest.useRealTimers();
  }
});
