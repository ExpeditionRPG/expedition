import * as express from 'express';
import * as http from 'http';
import { mockReq, mockRes } from 'sinon-express-mock';
import Config from './config';
import logging from './lib/logging';
import { setupDB, setupLogging, setupRoutes, setupSession } from './index';
import { testingDBWithState } from './models/TestData';
describe('API startup', () => {
  test('starts an HTTP server with installed routes', async () => {
    const db = await testingDBWithState([]);
    const app = express();
    setupRoutes(db, app);
    setupLogging(app);
    const server = http.createServer(app);
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const port = (server.address() as any).port;
      const result = await new Promise<number>((resolve, reject) =>
        http
          .get('http://127.0.0.1:' + port + '/no-such-route', res => {
            res.resume();
            res.on('end', () => resolve(res.statusCode!));
          })
          .on('error', reject),
      );
      expect(result).toBe(404);
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
      await db.sequelize.close();
    }
  });
  test('initializes a usable persistent session store', async () => {
    const db = await testingDBWithState([]);
    const app = express();
    const original = Config.get.bind(Config);
    jest
      .spyOn(Config, 'get')
      .mockImplementation((key: string) =>
        key === 'SESSION_SECRET' ? 'test-secret' : original(key),
      );
    const store = setupSession(db, app);
    try {
      await store.sync();
      await new Promise<void>((resolve, reject) =>
        store.set(
          'test-session',
          {
            cookie: { expires: new Date(Date.now() + 60000) },
            passport: { user: 'alice' },
          },
          (err: Error) => (err ? reject(err) : resolve()),
        ),
      );
      const value = await new Promise<any>((resolve, reject) =>
        store.get('test-session', (err: Error, result: any) =>
          err ? reject(err) : resolve(result),
        ),
      );
      expect(value.passport.user).toBe('alice');
    } finally {
      store.stopExpiringSessions();
      await db.sequelize.close();
    }
  });
  test('sets up routes and static asset middleware', () => {
    const app: any = { use: jest.fn() };
    setupRoutes({} as any, app);
    expect(
      app.use.mock.calls[0][0].stack.some(
        (layer: any) => layer.route?.path === '/quests',
      ),
    ).toBe(true);
    expect(app.use).toHaveBeenCalledWith('/images', expect.any(Function));
  });
  test('returns a configured database without opening a network connection', async () => {
    jest.spyOn(Config, 'get').mockImplementation(
      (key: string) =>
        ({
          DATABASE_URL: 'postgres://test:test@localhost/test',
          SEQUELIZE_SSL: false,
        })[key],
    );
    const db = setupDB();
    expect(db.sequelize.getDialect()).toBe('postgres');
    expect(db.sessions.getTableName()).toBeDefined();
    await db.sequelize.close();
  });
  test('sets up 404 handling', () => {
    const app: any = { use: jest.fn() };
    setupLogging(app);
    const res = mockRes();
    app.use.mock.calls[1][0](mockReq(), res);
    expect(res.status.calledWith(404)).toBe(true);
    expect(res.send.calledWith('Not Found')).toBe(true);
  });
  test('logs errors and sends a generic response without exposing internals', () => {
    const app: any = { use: jest.fn() };
    setupLogging(app);
    expect(app.use.mock.calls[0][0]).toBe(logging.errorLogger);
    const res = mockRes();
    app.use.mock.calls[2][0](
      new Error('database password'),
      mockReq(),
      res,
      jest.fn(),
    );
    expect(res.status.calledWith(500)).toBe(true);
    expect(res.send.calledWith('Something broke!')).toBe(true);
  });
});
