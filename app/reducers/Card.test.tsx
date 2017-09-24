import {card} from './Card'
import {toCard} from '../actions/Card'
import {NAVIGATION_DEBOUNCE_MS}  from '../Constants'

describe('Card reducer', () => {
  it('Defaults to splash card', () => {
    expect(card(undefined, {type: 'NO_OP'})).toEqual(jasmine.objectContaining({
      name: 'SPLASH_CARD',
    }) as any);
  });

  it('Sets state and phase on toCard', () => {
    expect(card(undefined, toCard('SEARCH_CARD', 'DISCLAIMER'))).toEqual(jasmine.objectContaining({
      name: 'SEARCH_CARD',
      phase: 'DISCLAIMER',
    }) as any);
  });

  it('Does not debounce after some time', () => {
    let fixedNow = Date.now();
    spyOn(Date, 'now').and.callFake(function() {
      return fixedNow;
    });

    const state = card(undefined, toCard('SEARCH_CARD'));

    fixedNow += NAVIGATION_DEBOUNCE_MS + 10
    expect(card(state, toCard('QUEST_CARD'))).toEqual(jasmine.objectContaining({
      name: 'QUEST_CARD',
    }) as any);
  });

  it('Debounces NAVIGATE actions', () => {
    let fixedNow = Date.now();
    spyOn(Date, 'now').and.callFake(function() {
      return fixedNow;
    });

    const state = card(undefined, toCard('SEARCH_CARD'));

    fixedNow += 50 // ms
    expect(card(state, toCard('QUEST_CARD'))).toEqual(jasmine.objectContaining({
      name: 'SEARCH_CARD',
    }) as any);
  });

  it('Respects overrideDebounce', () => {
    let fixedNow = Date.now();
    spyOn(Date, 'now').and.callFake(function() {
      return fixedNow;
    });

    const state = card(undefined, toCard('SEARCH_CARD'));

    fixedNow += 50 // ms
    expect(card(state, toCard('QUEST_CARD', null, true))).toEqual(jasmine.objectContaining({
      name: 'QUEST_CARD',
    }) as any);
  })
});
