describe('Combat', () => {
  describe('DRAW_ENEMIES', () => {
    it('renders all enemies in props');
  });

  describe('NO_TIMER', () => {
    it('shows non-timer prep card');
  });

  describe('PREPARE', () => {
    it('shows preparation card');
  });

  describe('TIMER', () => {
    it('shows timer card');
  });

  describe('SURGE', () => {
    it('shows surge card');
  });

  describe('RESOLVE_ABILITIES', () => {
    it('shows horror persona helper');
    it('shows rolls if enabled in settings');
  });

  describe('RESOLVE_DAMAGE', () => {
    it('starts at current player and tier count');
  });

  describe('VICTORY', () => {
    it('shows a victory page');
    it('shows healing if not suppressed');
    it('shows loot if not suppressed');
    it('shows levelup if not suppressed');
  });

  describe('DEFEAT', () => {
    it('does not show Retry button if onLose does not go to **end**');
    it('shows Retry button if onLose goes to **end**');
    it('hitting Retry returns the state to the card before combat');
  });

  describe('MID_COMBAT_ROLEPLAY', () => {
    it('shows the current parsernode in a dark theme');
  });

  describe('MID_COMBAT_DECISION', () => {
    it('shows a Decision element when no scenario chosen');
    it('shows a Decision element when outcome=retry');
    it('shows success page on outcome=success');
    it('shows failure page on outcome=failure');
    it('shows interrupted page on outcome=interrupted');
  });
});
