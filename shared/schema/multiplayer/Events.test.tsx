import {Event} from './Events'

describe('Event Schema', () => {
  const base = {session: 3456, timestamp: new Date()};
  it('is invalid when missing session/timestamp', () => {
    expect(Event.create({...base, session: undefined}) instanceof Error).toEqual(true);
    expect(Event.create({...base, timestamp: undefined}) instanceof Error).toEqual(true);
  });
  it('is valid when session/timestamp given', () => {
    const f = new Event(base);
    expect(f.session).toEqual(base.session);
    expect(f.timestamp).toEqual(base.timestamp);
  });
})
