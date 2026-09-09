import {
  fetchLocal,
  handleFetchErrors,
  handleFetchErrorsAsString,
} from './index';
describe('request helpers', () => {
  test('preserves successful responses', async () => {
    const response = { ok: true };
    expect(handleFetchErrors(response)).toBe(response);
    await expect(handleFetchErrorsAsString(response)).resolves.toBe(response);
  });
  test('throws status text or response body for HTTP errors', async () => {
    const response = {
      ok: false,
      statusText: 'Bad Request',
      text: jest.fn().mockResolvedValue('Invalid quest'),
    };
    expect(() => handleFetchErrors(response)).toThrow('Bad Request');
    await expect(handleFetchErrorsAsString(response)).rejects.toThrow(
      'Invalid quest',
    );
  });
  test.each(['load', 'error', 'abort'])('handles local XHR %s', async event => {
    const request: any = {
      open: jest.fn(),
      send: jest.fn(),
      response: '<quest/>',
    };
    jest.spyOn(window, 'XMLHttpRequest').mockImplementation(() => request);
    const result = fetchLocal('file:///quest.xml');
    expect(request.open).toHaveBeenCalledWith('GET', 'file:///quest.xml');
    expect(request.send).toHaveBeenCalledTimes(1);
    const assertion =
      event === 'load'
        ? expect(result).resolves.toBe('<quest/>')
        : expect(result).rejects.toThrow(
            event === 'error' ? 'network error' : 'connection aborted',
          );
    request['on' + event]();
    await assertion;
  });
});
