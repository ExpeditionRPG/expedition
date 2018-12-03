
export function fakeConnection() {
  return {
    getMaxBufferID: jasmine.createSpy('getMaxBufferID').and.returnValue(null),
    registerEventRouter: jasmine.createSpy('registerEventRouter'),
    getClientKey: jasmine.createSpy('getClientKey'),
    sendEvent: jasmine.createSpy('sendEvent'),
    hasInFlight: jasmine.createSpy('hasInFlight'),
    getClientAndInstance: jasmine.createSpy('getClientAndInstance').and.returnValue([123, 456]),
    committedEvent: jasmine.createSpy('committedEvent'),
    rejectedEvent: jasmine.createSpy('rejectedEvent'),
    publish: jasmine.createSpy('publish'),
    sync: jasmine.createSpy('sync'),
    subscribe: jasmine.createSpy('subscribe'),
    unsubscribe: jasmine.createSpy('unsubscribe'),
  };
}
