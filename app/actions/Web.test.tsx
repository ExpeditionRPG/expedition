describe('Web action', () => {
  describe('fetchQuestXML', () => {
    it('shows snackbar on request error');
    it('dispatches loaded quest');
  });

  describe('loadQuestXML', () => {
    // Tested via fetchQuestXML
  });

  describe('search', () => {
    it('shows snackbar on request error');
    it('dispatches search response');
  });

  describe('subscribe', () => {
    it('shows snackbar on request error');
  });

  describe('submitUserFeedback', () => {
    it('shows snackbar on request error');
    it('clears feedback after submission');
    it('shows snackbar on successful submission');
  });
});
