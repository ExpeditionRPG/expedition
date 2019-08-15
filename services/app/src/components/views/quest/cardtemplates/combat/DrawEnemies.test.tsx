
describe('DRAW_ENEMIES', () => {
  test('renders all enemies in props', () => {
    /*
    const combat = newCombat(TEST_NODE);
    const {enzymeWrapper} = setup(CombatPhase.drawEnemies, {combat});
    expect(enzymeWrapper.find('h2.draw_enemies').map((e) => e.text())).toEqual([
      'Thief (Tier I )',
      'Brigand (Tier I )',
      'Footpad (Tier I )',
    ]);
    */
  });
  test.skip('calls tierSumDelta when tier changed (no enemies)', () => { /* TODO */ });
  test.skip('if no enemies, displays current tier', () => { /* TODO */ });
});
