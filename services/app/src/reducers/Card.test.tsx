import configureStore  from 'redux-mock-store';
import {toCard} from '../actions/Card';
import {NAVIGATION_DEBOUNCE_MS}  from '../Constants';
import {MultiplayerClient} from '../Multiplayer';
import {Reducer} from '../Testing';
import {card} from './Card';

describe('Card reducer', () => {
  let client: any;
  let dispatched: any;
  beforeEach(() => {
    client = new MultiplayerClient();
    const store = configureStore([client.createActionMiddleware()])({});
    dispatched = (a: any) => {
      store.dispatch(a);
      const result = store.getActions();
      store.clearActions();
      return result[result.length - 1];
    };
  });

  it('Defaults to splash card', () => {
    expect(card(undefined, {type: 'NO_OP'})).toEqual(jasmine.objectContaining({name: 'SPLASH_CARD'} as any));
  });

  it('Sets state and phase on toCard', () => {
    Reducer(card).withState({})
      .expect(toCard({name: 'SEARCH_CARD', phase: 'DISCLAIMER'}))
      .toChangeState({name: 'SEARCH_CARD', phase: 'DISCLAIMER'});
  });

  it('Does not debounce after some time', () => {
    const then = Date.now();
    spyOn(Date, 'now').and.callFake(function() {
      return then + NAVIGATION_DEBOUNCE_MS + 10;
    });
    Reducer(card).withState({name: 'SEARCH_CARD', ts: then})
      .expect(toCard({name: 'QUEST_CARD'}))
      .toChangeState({name: 'QUEST_CARD'});
  });

  it('Debounces NAVIGATE actions', () => {
    const then = Date.now();
    spyOn(Date, 'now').and.callFake(function() {
      return then + 50;
    });
    Reducer(card).withState({name: 'SEARCH_CARD', ts: then})
      .expect(toCard({name: 'SEARCH_CARD'}))
      .toChangeState({name: 'SEARCH_CARD'});
  });

  it('Respects overrideDebounce', () => {
    const then = Date.now();
    spyOn(Date, 'now').and.callFake(function() {
      return then + 50;
    });
    Reducer(card).withState({name: 'SEARCH_CARD', ts: then})
      .expect(toCard({name: 'QUEST_CARD', overrideDebounce: true}))
      .toChangeState({name: 'QUEST_CARD'});
  });
});
