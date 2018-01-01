import {ClientID, RemotePlayEvent, RemotePlayEventBody} from './Events'
import {ClientBase} from './Client'

export class TestClient extends ClientBase {
  public events: RemotePlayEvent[];

  constructor() {
    super();
    this.events = [];
  }

  doHandleMessage(e: RemotePlayEvent) {
    return this.handleMessage(e);
  }

  setConnectState(connected: boolean) {
    this.connected = connected;
  }

  sendFinalizedEvent(e: RemotePlayEvent) {
    this.events.push(e);
  }

  disconnect() {}
}

describe('Client', () => {
  const basicEventBody: RemotePlayEventBody = {type: 'STATUS'};
  const basicEvent: RemotePlayEvent = {client: 'testclient', instance: 'testinstance', event: basicEventBody, id: null};

  it('safely handles malformed messages', (done) => {
    const c = new TestClient();
    c.subscribe((e: RemotePlayEvent) => {
      expect(e.event.type).toEqual('ERROR');
      done();
    });
    c.doHandleMessage({} as any as RemotePlayEvent);
  });

  it('safely handles unknown message types', (done) => {
    const c = new TestClient();
    c.subscribe((e: RemotePlayEvent) => {
      expect(e.event.type).toEqual('ERROR');
      done();
    });
    c.doHandleMessage({client: 'testclient', instance: 'testinstance', event: {type: 'UNKNOWN_EVENT_TYPE'}, id: 0} as any as RemotePlayEvent);
  });

  it('can subscribe & callback handlers', (done) => {
    const c = new TestClient();
    c.subscribe((e: RemotePlayEvent) => {
      expect(e).toEqual(basicEvent);
      done();
    });
    c.doHandleMessage(basicEvent);
  });

  it('does not try to send if not connected', () => {
    const c = new TestClient();
    c.setConnectState(false);
    c.sendEvent(basicEventBody);
    expect(c.events).toEqual([]);
  });

  it('finalizes and sends messages', () => {
    const c = new TestClient();
    c.configure('testclient', 'testinstance');
    c.setConnectState(true);
    c.sendEvent(basicEventBody);
    expect(c.events).toEqual([basicEvent]);
  })
});
