import {SessionClient} from './SessionClients'

describe('SessionClient Schema', () => {
  const base = {session: 3456, client: '54321'};
  it('is invalid when missing session/client', () => {
    expect(SessionClient.create({...base, session: undefined}) instanceof Error).toEqual(true);
    expect(SessionClient.create({...base, client: undefined}) instanceof Error).toEqual(true);
  });
  it('is valid when session/client given', () => {
    const f = new SessionClient(base);
    expect(f.session).toEqual(base.session);
    expect(f.client).toEqual(base.client);
  });
})
