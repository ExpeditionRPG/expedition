import {ClientID, RemotePlayEvent} from './Events'
import {ClientBase} from './Client'
import {BrokerBase, InMemoryBroker} from './Broker'

export class TestClient extends ClientBase {
  b: BrokerBase;

  constructor(b: BrokerBase) {
    super();
    this.b = b;
  }

  getMessageHandler(): ((e: RemotePlayEvent) => any) {
    return this.handleMessage;
  }

  getID() {
    return this.id;
  }

  sendEvent(e: RemotePlayEvent) {}
}

describe('Client', () => {
  it('handles unknown message types');
  it('dedupes client statuses');
});

describe('Broker/Client Behavior', () => {
  let b: InMemoryBroker;
  let c1: TestClient;
  let c2: TestClient;

  beforeEach(() => {
    b = new InMemoryBroker();
    c1 = new TestClient(b);
    c2 = new TestClient(b);
    b.addClientHandler(c1.getID(), c1.getMessageHandler());
    b.addClientHandler(c2.getID(), c2.getMessageHandler());
  });

  it('can pass messages');
});
