import {Session} from './Sessions'

describe('Session Schema', () => {
  const base = {id: 3456};
  it('is invalid when missing id', () => {
    expect(Session.create({}) instanceof Error).toEqual(true);
  });
  it('is valid when id given', () => {
    const f = new Session(base);
    expect(f.id).toEqual(base.id);
  });
})
