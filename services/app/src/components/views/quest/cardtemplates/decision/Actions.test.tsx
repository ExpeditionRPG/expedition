describe('Decision actions', () => {
  describe('extractDecision', () => {
    it('extracts the decision from a node');
    it('handles null node');
  });
  describe('initDecision', () => {
    it('sets up decision template within node using qdl');
  });
  describe('computeSuccesses', () => {
    it('works when zero rolls');
    it('counts successes and ignores other rolls');
    it('respects difficulty');
  });
  describe('computeOutcome', () => {
    it('computes success');
    it('computes failure');
    it('computes interrupted');
    it('computes retry');
    it('returns null when no selected decision');
  });
  describe('generateLeveledChecks', () => {
    it('returns 3 semi-unique, generated checks');
    it('scales num successes with num adventurers');
    it('scales difficulty with the number of times this type of check was selected previously');
  });
  describe('skillTimeMillis', () => {
    it('respects settings');
    it('scales with player count');
  });
  describe('handleDecisionRoll', () => {
    it('pushes the roll value onto the node');
    it('returns name of matching outcome event in the node');
    it('returns null if no matching outcome event');
  });
  describe('toDecisionCard', () => {
    it('goes to MID_COMBAT_DECISION if in combat');
    it('does pass-thru to toCard if not in combat');
  });
});
