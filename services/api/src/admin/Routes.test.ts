import * as express from 'express';
import { mockReq, mockRes } from 'sinon-express-mock';
import Config from '../config';
import { installRoutes } from './Routes';
import { limitCors } from '../lib/cors';
describe('admin routes', () => {
  test('installs all administration endpoints with CORS first', () => {
    const router = express.Router();
    installRoutes({} as any, router);
    expect(router.stack).toHaveLength(7);
    for (const layer of router.stack) {
      expect(layer.route.path).toMatch(/^\/admin\//);
      expect(layer.route.stack[0].handle).toBe(limitCors);
    }
  });
  test.each([undefined, 'ordinary-user', 'admin'])(
    'requires admin auth for every route, including ratings (%s)',
    id => {
      jest.spyOn(Config, 'get').mockReturnValue('["admin"]');
      const router = express.Router();
      installRoutes({} as any, router);
      for (const layer of router.stack) {
        const res = mockRes();
        res.locals = { id };
        const next = jest.fn();
        layer.route.stack[1].handle(mockReq(), res, next);
        if (id === 'admin') {
          expect(next).toHaveBeenCalledTimes(1);
        } else {
          expect(res.status.calledWith(401)).toBe(true);
          expect(next).not.toHaveBeenCalled();
        }
      }
    },
  );
});
