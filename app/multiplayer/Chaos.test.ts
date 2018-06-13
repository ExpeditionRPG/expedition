describe('RP chaos tester', () => {
  it('stays off when disabled');
  it('randomly fails to verify user membership in session');
  it('randomly rejects upserts as conflicting');
  it('randomly replays messages to the client');
  it('randomly fuzzes messages to the server');
  it('randomly delays outbound messages');
  it('randomly drops outbound messages');
});
