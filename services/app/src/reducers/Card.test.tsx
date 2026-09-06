import { toCard } from '../actions/Card';
import { NAVIGATION_DEBOUNCE_MS } from '../Constants';
import { Reducer } from '../Testing';
import { card } from './Card';

describe('Card reducer', () => {
  test('Defaults to splash card', () => {
    expect(card(undefined, { type: 'NO_OP' })).toEqual(
      expect.objectContaining({ name: 'SPLASH_CARD' } as any),
    );
  });

  test('Sets state and phase on toCard', () => {
    Reducer(card)
      .withState({})
      .expect(toCard({ name: 'SEARCH_CARD', phase: 'DISCLAIMER' }))
      .toChangeState({ name: 'SEARCH_CARD', phase: 'DISCLAIMER' });
  });

  // The reducer only debounces when the incoming key matches the one already
  // in state, and toCard() derives that key from the card name - so a fixture
  // without `key` never reaches the debounce branch at all and these tests
  // would pass with the debouncing deleted.
  const debounceState = { name: 'SEARCH_CARD', key: 'SEARCH_CARD', ts: 0 };

  test('Does not debounce after some time', () => {
    jest
      .spyOn(Date, 'now')
      .mockImplementation(() => NAVIGATION_DEBOUNCE_MS + 10);
    Reducer(card)
      .withState({ ...debounceState })
      .expect(toCard({ name: 'SEARCH_CARD' }))
      .toChangeState({ name: 'SEARCH_CARD', ts: NAVIGATION_DEBOUNCE_MS + 10 });
  });

  test('Debounces NAVIGATE actions', () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 50);
    Reducer(card)
      .withState({ ...debounceState })
      .expect(toCard({ name: 'SEARCH_CARD' }))
      // Identity, not shape: the debounced reducer must hand back the very
      // state object it was given, untouched.
      .toStayTheSame();
  });

  test('Respects overrideDebounce', () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 50);
    Reducer(card)
      .withState({ ...debounceState })
      .expect(toCard({ name: 'SEARCH_CARD', overrideDebounce: true }))
      // Same key and well inside the debounce window, so only overrideDebounce
      // can be what let this through; questId is proof the new card won.
      .toChangeState({ name: 'SEARCH_CARD', ts: 50, questId: null });
  });
});
