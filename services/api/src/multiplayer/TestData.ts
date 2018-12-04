
export function newMockWebsocket() {
  return {
    readyState: WebSocket.OPEN,
    send: jasmine.createSpy('send'),
  };
}
