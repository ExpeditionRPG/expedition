import { maybeParse, ParsableResponse } from './Web';

function response(
  status: number,
  body: string,
  json?: () => Promise<any>,
): ParsableResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body),
    json:
      json ||
      (() => {
        // Mirrors a real Response: r.json() on a non-JSON body rejects.
        try {
          return Promise.resolve(JSON.parse(body));
        } catch (e) {
          return Promise.reject(e);
        }
      }),
  };
}

describe('Web actions', () => {
  describe('maybeParse', () => {
    test('surfaces a plain-text error body verbatim', async () => {
      // requireAdminAuth answers res.status(401).end('You are not signed in.')
      // with no Content-Type. Calling r.json() on that used to replace the
      // message with a SyntaxError about "You are no"... not being valid JSON.
      await expect(
        maybeParse(response(401, 'You are not signed in.')),
      ).rejects.toThrow('You are not signed in.');
    });

    test('does not leak a JSON parse error to the operator', async () => {
      await expect(
        maybeParse(response(401, 'You are not signed in.')),
      ).rejects.not.toThrow(/JSON/);
    });

    test('prefers the error field of a JSON error body', async () => {
      await expect(
        maybeParse(
          response(500, JSON.stringify({ error: 'Database is down' })),
        ),
      ).rejects.toThrow('Database is down');
    });

    test('falls back to the raw body when JSON carries no error field', async () => {
      await expect(
        maybeParse(response(500, JSON.stringify({ status: 'BROKEN' }))),
      ).rejects.toThrow('{"status":"BROKEN"}');
    });

    test('reports the status code when the error body is empty', async () => {
      await expect(maybeParse(response(502, '   '))).rejects.toThrow(
        'Server Error (502)',
      );
    });

    test('parses the body as JSON on success', async () => {
      await expect(
        maybeParse(response(200, JSON.stringify([{ id: 'q1' }]))),
      ).resolves.toEqual([{ id: 'q1' }]);
    });
  });
});
