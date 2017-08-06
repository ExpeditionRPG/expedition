describe('CombinedReducers', () => {
  it('appends to _history on new NAVIGATE action');
  it('pops history until node type present in RETURN is seen');
  it('pops history once if RETURN without target node');
  it('pops history, skipping specified card types');
});
