import {card} from './Card'
import {toCard} from '../actions/Card'

describe('Card reducer', () => {
  it('Defaults to splash card', () => {
    expect(card(undefined, {type: 'NO_OP'})).toEqual(jasmine.objectContaining({
      name: 'SPLASH_CARD',
    }));
  });

  it('Sets state and phase on toCard', () => {
    expect(card(undefined, toCard('SEARCH_CARD', 'DISCLAIMER'))).toEqual(jasmine.objectContaining({
      name: 'SEARCH_CARD',
      phase: 'DISCLAIMER',
    }));
  });

  it('Does not debounce after some time', () => {
    var fixedNow = Date.now();
    spyOn(Date, 'now').and.callFake(function() {
      return fixedNow;
    });

    var state = card(undefined, toCard('SEARCH_CARD'));

    fixedNow += 500 // ms
    expect(card(state, toCard('QUEST_CARD'))).toEqual(jasmine.objectContaining({
      name: 'SEARCH_CARD',
    }));
  });

  it('Debounces NAVIGATE actions', () => {
    var fixedNow = Date.now();
    spyOn(Date, 'now').and.callFake(function() {
      return fixedNow;
    });

    var state = card(undefined, toCard('SEARCH_CARD'));

    fixedNow += 50 // ms
    expect(card(state, toCard('QUEST_CARD'))).toEqual(jasmine.objectContaining({
      name: 'SEARCH_CARD',
    }));
  });

  it('Respects overrideDebounce', () => {
    var fixedNow = Date.now();
    spyOn(Date, 'now').and.callFake(function() {
      return fixedNow;
    });

    var state = card(undefined, toCard('SEARCH_CARD'));

    fixedNow += 50 // ms
    expect(card(state, toCard('QUEST_CARD', null, true))).toEqual(jasmine.objectContaining({
      name: 'QUEST_CARD',
    }));
  })
});