describe('Decision actions', () => {
  describe('extractDecision', () => {
    test.skip('extracts the decision from a node', () => { /* TODO */ });
    test.skip('handles null node', () => { /* TODO */ });
  });
  describe('initDecision', () => {
    test.skip('sets up decision template within node using qdl', () => { /* TODO */ });
  });
  describe('computeSuccesses', () => {
    test.skip('works when zero rolls', () => { /* TODO */ });
    test.skip('counts successes and ignores other rolls', () => { /* TODO */ });
    test.skip('respects difficulty', () => { /* TODO */ });
  });
  describe('computeOutcome', () => {
    test.skip('computes success', () => { /* TODO */ });
    test.skip('computes failure', () => { /* TODO */ });
    test.skip('computes interrupted', () => { /* TODO */ });
    test.skip('computes retry', () => { /* TODO */ });
    test.skip('returns null when no selected decision', () => { /* TODO */ });
  });
  describe('generateLeveledChecks', () => {
    test.skip('returns 3 semi-unique, generated checks', () => { /* TODO */ });
    test.skip('scales num successes with num adventurers', () => { /* TODO */ });
    test.skip('scales difficulty with the number of times this type of check was selected previously', () => { /* TODO */ });
  });
  describe('skillTimeMillis', () => {
    test.skip('respects settings', () => { /* TODO */ });
    test.skip('scales with player count', () => { /* TODO */ });
  });
  describe('handleDecisionRoll', () => {
    test.skip('pushes the roll value onto the node', () => { /* TODO */ });
    test.skip('returns name of matching outcome event in the node', () => { /* TODO */ });
    test.skip('returns null if no matching outcome event', () => { /* TODO */ });
  });
  describe('toDecisionCard', () => {
    test.skip('goes to MID_COMBAT_DECISION if in combat', () => { /* TODO */ });
    test.skip('does pass-thru to toCard if not in combat', () => { /* TODO */ });
  });
});
