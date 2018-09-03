import {toCard} from '../actions/Card';
import {NAVIGATION_DEBOUNCE_MS} from '../Constants';
import {Reducer} from '../Testing';
import {card} from './Card';

describe('Card reducer', () => {
  test('Defaults to splash card', () => {
    expect(card(undefined, {type: 'NO_OP'})).toEqual(jasmine.objectContaining({name: 'SPLASH_CARD'} as any));
  });

  test('Sets state and phase on toCard', () => {
    Reducer(card).withState({})
      .expect(toCard({name: 'SEARCH_CARD', phase: 'DISCLAIMER'}))
      .toChangeState({name: 'SEARCH_CARD', phase: 'DISCLAIMER'});
  });

  test('Does not debounce after some time', () => {
    const then = Date.now();
    spyOn(Date, 'now').and.callFake(() => {
      return then + NAVIGATION_DEBOUNCE_MS + 10;
    });
    Reducer(card).withState({name: 'SEARCH_CARD', ts: then})
      .expect(toCard({name: 'QUEST_CARD'}))
      .toChangeState({name: 'QUEST_CARD'});
  });

  test('Debounces NAVIGATE actions', () => {
    const then = Date.now();
    spyOn(Date, 'now').and.callFake(() => {
      return then + 50;
    });
    Reducer(card).withState({name: 'SEARCH_CARD', ts: then})
      .expect(toCard({name: 'SEARCH_CARD'}))
      .toChangeState({name: 'SEARCH_CARD'});
  });

  test('Respects overrideDebounce', () => {
    const then = Date.now();
    spyOn(Date, 'now').and.callFake(() => {
      return then + 50;
    });
    Reducer(card).withState({name: 'SEARCH_CARD', ts: then})
      .expect(toCard({name: 'QUEST_CARD', overrideDebounce: true}))
      .toChangeState({name: 'QUEST_CARD'});
  });
});
