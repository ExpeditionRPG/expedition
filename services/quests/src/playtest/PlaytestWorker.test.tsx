describe('PlaytestWorker', () => {
  const previous = window.onmessage;
  afterEach(() => {
    window.onmessage = previous;
    jest.clearAllTimers();
    jest.useRealTimers();
  });
  test('crawls actual quest XML, reports errors and completion, and closes', () => {
    jest.useFakeTimers();
    const post = jest
      .spyOn(window, 'postMessage')
      .mockImplementation(() => undefined);
    const close = jest
      .spyOn(window, 'close')
      .mockImplementation(() => undefined);
    require('./PlaytestWorker');
    (window.onmessage as any)({
      data: {
        type: 'RUN',
        xml: '<quest><roleplay data-line="0">Hello</roleplay></quest>',
        settings: {},
      },
    });
    jest.runAllTimers();
    expect(post).toHaveBeenCalledWith(
      expect.objectContaining({
        error: [expect.objectContaining({ url: '430' })],
      }),
    );
    expect(post).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'COMPLETE',
        lines: 1,
        ms: expect.any(Number),
      }),
    );
    expect(close).toHaveBeenCalledTimes(1);
  });
});
