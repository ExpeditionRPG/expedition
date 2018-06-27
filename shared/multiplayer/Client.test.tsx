import {MultiplayerEvent, MultiplayerEventBody} from './Events'
import {ClientBase} from './Client'

export class TestClient extends ClientBase {
  public events: MultiplayerEvent[];

  constructor() {
    super();
    this.events = [];
  }

  doParseEvent(s: string) {
    return this.parseEvent(s);
  }

  setConnectState(connected: boolean) {
    this.connected = connected;
  }

  sendFinalizedEvent(e: MultiplayerEvent) {
    this.events.push(e);
  }

  disconnect() {}
}

describe('Client', () => {
  const basicEventBody: MultiplayerEventBody = {type: 'STATUS'};
  const basicEvent: MultiplayerEvent = {client: 'testclient', instance: 'testinstance', event: basicEventBody, id: null};

  it('safely handles malformed messages', () => {
    const c = new TestClient();
    expect(c.doParseEvent('{}').event.type).toEqual('ERROR');
  });

  it('safely handles unknown message types', () => {
    const c = new TestClient();
    expect(c.doParseEvent(JSON.stringify({
      client: 'testclient', instance: 'testinstance', event: {type: 'UNKNOWN_EVENT_TYPE'}, id: 0,
    } as any as MultiplayerEvent)).event.type).toEqual('ERROR');
  });

  it('can subscribe & callback handlers', () => {
    const c = new TestClient();
    expect(c.doParseEvent(JSON.stringify(basicEvent))).toEqual(basicEvent);
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
