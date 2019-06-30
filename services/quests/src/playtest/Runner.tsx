// This file is a quick hack and not used by external users!
// When loaded, it does a default search and runs the playtest code against all results,
// displaying any playtest errors as well as a link to the quest and the author's contact details.

import {fetchSearchResults} from 'app/actions/Search';
import {initialSearch} from 'app/reducers/Search';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {connect, Provider} from 'react-redux';
import Redux, {applyMiddleware, compose, createStore} from 'redux';
import thunk from 'redux-thunk';

interface RunState {[id: string]: {xml: string, messages: string[], complete: boolean}; }

const middleware = [thunk];
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
function reduce(state: RunState, action: Redux.Action): RunState {
  state = state || ({} as RunState);

  const id = (action as any).id;
  if (!id) {
    return state;
  }

  switch (action.type) {
    case 'PLAYTEST_START':
      state = {...state, [id]: {title: (action as any).title, email: (action as any).email, author: (action as any).author, messages: [], complete: false}};
      break;
    case 'PLAYTEST_COMPLETE':
      state = {...state, [id]: {...state[id]}};
      state[id].complete = true;
      break;
    case 'PLAYTEST_MESSAGE':
      state = {...state, [id]: {...state[id]}};
      state[id].messages = (action as any).msg;
      break;
    case 'PLAYTEST_ERROR':
      state = {...state, [id]: {...state[id]}};
      state[id].messages = (action as any).msg;
      break;
    default:
      break;
  }
  return state;
}

const store = createStore(reduce, {}, composeEnhancers(applyMiddleware(...middleware)));

function startSearching() {
  fetchSearchResults(initialSearch.params).then((results: any) => {
    const proms: any[] = [];
    for (const r of results.quests) {
      proms.push(fetch(r.publishedurl).then((response) => response.text()).then((xml) => {
        return {id: r.id, title: r.title, author: r.author, email: r.email, xml};
      }));
    }
    return Promise.all(proms);
  }).then((loadedQuests: any) => {
    for (const q of loadedQuests) {
      if (!(window as any).Worker) {
        console.log('Web worker not available, skipping playtest.');
        return;
      }

      const worker = new Worker('playtest.js');
      worker.onerror = (ev: ErrorEvent) => {
        store.dispatch({type: 'PLAYTEST_ERROR', msg: ev.error, id: q.id});
        worker.terminate();
      };
      worker.onmessage = (e: MessageEvent) => {
        if (e.data.status === 'COMPLETE') {
          store.dispatch({type: 'PLAYTEST_COMPLETE', id: q.id});
        } else {
          store.dispatch({type: 'PLAYTEST_MESSAGE', msg: e.data.error, id: q.id});
        }
      };

      worker.postMessage({type: 'RUN', xml: q.xml, settings: {
        expansionhorror: true,
        expansionfuture: true,
        expansionwyrmsgiants: true,
        expansionscarredlands: true,
      }});
      console.log('started worker for quest ' + q.id);
      store.dispatch({type: 'PLAYTEST_START', id: q.id, title: q.title, author: q.author, email: q.email});
    }
  });
}

setTimeout(() => {
  startSearching();
}, 1000);

interface Props {
  state: any;
}

const Main = (props: Props): JSX.Element => {
  const results: JSX.Element[] = [];
  for (const id of Object.keys(props.state)) {
    const msgs = props.state[id].messages.map((msg: any, i: number) => {
      return <li key={i}>{JSON.stringify(msg)}</li>;
    });
    results.push(
      <div key={id}>
        <h3>
          <a href={'https://quests.expeditiongame.com/#' + id} target="_blank">{props.state[id].title}</a>
          &nbsp;by {props.state[id].author}
          &nbsp;({props.state[id].email})
          &nbsp;{(props.state[id].complete) ? 'DONE' : '...'}
        </h3>
        <ul>
          {msgs}
        </ul>
      </div>
    );
  }

  return <div>{results}</div>;
};

const mapStateToProps = (state: any): any => {
  return {state};
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): any => {
  return {};
};

const MainContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);

const render = () => {
  const base = document.getElementById('react-app');
  if (!base) {
    throw new Error('Could not find react-app element');
  }
  ReactDOM.unmountComponentAtNode(base);
  ReactDOM.render(
      <Provider store={store}>
        <MainContainer/>
      </Provider>,
    base
  );
};
render();
