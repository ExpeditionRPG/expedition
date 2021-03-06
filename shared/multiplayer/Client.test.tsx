import {ClientBase} from './Client';
import {MultiplayerEvent, MultiplayerEventBody} from './Events';

export class TestClient extends ClientBase {
  public events: MultiplayerEvent[];

  constructor() {
    super();
    this.events = [];
  }

  public doParseEvent(s: string) {
    return this.parseEvent(s);
  }

  public setConnectState(connected: boolean) {
    this.connected = connected;
  }

  public disconnect() {
    // Mock not needed for now
  }
}

describe('Client', () => {
  const basicEventBody: MultiplayerEventBody = {type: 'STATUS'};
  const basicEvent: MultiplayerEvent = {
    client: 'testclient',
    event: basicEventBody,
    id: null,
    instance: 'testinstance',
  };

  test('safely handles malformed messages', () => {
    const c = new TestClient();
    expect(c.doParseEvent('{}').event.type).toEqual('ERROR');
  });

  test('safely handles unknown message types', () => {
    const c = new TestClient();
    expect(c.doParseEvent(JSON.stringify({
      client: 'testclient',
      event: {type: 'UNKNOWN_EVENT_TYPE'},
      id: 0,
      instance: 'testinstance',
    } as any as MultiplayerEvent)).event.type).toEqual('ERROR');
  });

  test('can subscribe & callback handlers', () => {
    const c = new TestClient();
    expect(c.doParseEvent(JSON.stringify(basicEvent))).toEqual(basicEvent);
  });
});
