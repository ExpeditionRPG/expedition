import {
  getGA,
  setGA,
  getDocument,
  setDocument,
  getWindow,
  setWindow,
} from './Globals';
test('substitutes and restores browser and analytics references', () => {
  const oldDoc = getDocument(),
    oldWindow = getWindow(),
    oldGA = getGA();
  const doc = document.implementation.createHTMLDocument('Admin');
  const ga = { event: jest.fn() };
  try {
    setDocument(doc);
    setWindow(window);
    setGA(ga);
    expect(getDocument().title).toBe('Admin');
    expect(getWindow()).toBe(window);
    getGA().event('login');
    expect(ga.event).toHaveBeenCalledWith('login');
  } finally {
    setDocument(oldDoc);
    setWindow(oldWindow);
    setGA(oldGA);
  }
});
