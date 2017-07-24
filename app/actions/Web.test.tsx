describe('Web action', () => {
  describe('fetchQuestXML', () => {
    it('shows snackbar on request error'); // $10
    it('dispatches loaded quest'); // $10
  });

  describe('loadQuestXML', () => {
    // Tested via fetchQuestXML
  });

  describe('search', () => {
    it('shows snackbar on request error');  // $10
    it('dispatches search response'); // $10
  });

  describe('subscribe', () => {
    it('shows snackbar on request error'); // $10
  });

  describe('submitUserFeedback', () => {
    it('shows snackbar on request error'); // $10
    it('clears feedback after submission'); // $10
    it('shows snackbar on successful submission'); // $10
  });
});
