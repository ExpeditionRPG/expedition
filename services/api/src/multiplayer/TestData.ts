export function newMockWebsocket() {
  return {
    readyState: WebSocket.OPEN,
    send: jest.fn(),
  };
}
