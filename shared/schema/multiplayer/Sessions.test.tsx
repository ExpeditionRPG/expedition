import {Session} from './Sessions';

describe('Session Schema', () => {
  const base = {id: 3456};
  test('is invalid when missing id', () => {
    expect(Session.create({}) instanceof Error).toEqual(true);
  });
  test('is valid when id given', () => {
    const f = new Session(base);
    expect(f.id).toEqual(base.id);
  });
});
