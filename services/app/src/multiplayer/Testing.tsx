export function fakeConnection() {
  return {
    getMaxBufferID: jest.fn().mockReturnValue(null),
    registerEventRouter: jest.fn(),
    getClientKey: jest.fn(),
    sendEvent: jest.fn(),
    hasInFlight: jest.fn(),
    getClientAndInstance: jest.fn().mockReturnValue([123, 456]),
    committedEvent: jest.fn(),
    rejectedEvent: jest.fn(),
    publish: jest.fn(),
    sync: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  };
}
