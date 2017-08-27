describe('Combat', () => {
  describe('renderDrawEnemies', () => {
    it('renders all enemies in props');
  });

  describe('renderResolve', () => {
    it('renders rolls if they are enabled in settings');
  });

  describe('renderDefeat', () => {
    it('Does not show Retry button if onLose does not go to **end**');
    it('Shows Retry button if onLose goes to **end**');
    it('Hitting Retry returns the state to the card before combat');
  });
});
