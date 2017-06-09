describe('Renderer', () => {
  it('respects theme settings'); // using a theme, ensure stuff like showBacks, cardsPerPage are observed.

  it('renders all filtered cards'); // apply a filter, check that the number of <card> elements matches the number of filtered cards.

  it('handles zero cards'); // graceful handling of empty card set. Maybe display this to the user?
});
