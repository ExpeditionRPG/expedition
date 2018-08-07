describe('DRAW_ENEMIES', () => {
  it('renders all enemies in props', () => {
    const combat = newCombat(TEST_NODE);
    const {enzymeWrapper} = setup('DRAW_ENEMIES', {combat});
    expect(enzymeWrapper.find('h2.draw_enemies').map((e) => e.text())).toEqual([
      'Thief (Tier I )',
      'Brigand (Tier I )',
      'Footpad (Tier I )',
    ]);
  });
  it('calls tierSumDelta when tier changed (no enemies)');
  it('if no enemies, displays current tier');
});
