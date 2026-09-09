import { mockReq, mockRes } from 'sinon-express-mock';
import { limitCors } from './cors';
describe('limitCors', () => {
  test.each([
    'https://app.expeditiongame.com',
    'http://localhost:8080',
    'file://',
    'http://phone.local:8080',
  ])('allows supported origin %s with credentials', origin => {
    const res = mockRes();
    res.setHeader = jest.fn();
    res.getHeader = jest.fn();
    const next = jest.fn();
    limitCors(mockReq({ headers: { origin } }), res, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      origin,
    );
    expect(next).toHaveBeenCalled();
  });
  test.each([
    'https://evil.com',
    'https://fakeexpeditiongame.com',
    'https://notlocalhost',
    'https://app.expeditiongame.com.evil.com',
  ])('does not grant browser access to %s', origin => {
    const res = mockRes();
    res.setHeader = jest.fn();
    res.getHeader = jest.fn();
    limitCors(mockReq({ headers: { origin } }), res, jest.fn());
    expect(
      (res.setHeader as jest.Mock).mock.calls.some(
        c => c[0] === 'Access-Control-Allow-Origin',
      ),
    ).toBe(false);
  });
});
