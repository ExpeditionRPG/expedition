// This file is a quick hack and not used by external users!
// When loaded, it does a default search and runs the playtest code against all results,
// displaying any playtest errors as well as a link to the quest and the author's contact details.

import {fetchSearchResults} from 'app/actions/Search';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {connect, Provider} from 'react-redux';
import Redux, {applyMiddleware, compose, createStore} from 'redux';
import thunk from 'redux-thunk';

interface RunState {
  xml: string;
  messages: string[];
  complete: boolean;
  email: string;
  author: string;
  title: string;
}
interface RunStateMap {[id: string]: RunState; }

const middleware = [thunk];
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
function reduce(state: RunStateMap, action: Redux.Action): RunStateMap {
  state = state || ({} as RunStateMap);

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
  // Empty search params, least restriction
  fetchSearchResults({} as any).then((results: any) => {
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

function renderRunState(id: string, rs: RunState): JSX.Element {
  const msgs = rs.messages.map((msg: any, i: number) => {
    return <li key={i}>{JSON.stringify(msg)}</li>;
  });

  return (<div>
    <h3>
      <a href={'https://quests.expeditiongame.com/#' + id} target="_blank">{rs.title}</a>
      &nbsp;by {rs.author}
      &nbsp;({rs.email})
      &nbsp;{(rs.complete) ? 'DONE' : '...'}
    </h3>
    <ul>
      {msgs}
    </ul>
  </div>);
}

const Main = (props: Props): JSX.Element => {
  const stats = (<div>
    <div>Quests: {Object.keys(props.state).length}</div>
    <div>Complete: {Object.keys(props.state).filter((k: string) => props.state[k].complete).length}</div>
  </div>);

  const cleanResults: JSX.Element[] = [];
  const errorResults: JSX.Element[] = [];
  for (const id of Object.keys(props.state)) {

    if (props.state[id].messages.length > 0) {
      errorResults.push(<span key={id}>{renderRunState(id, props.state[id])}</span>);
    } else {
      cleanResults.push(<span key={id}>{renderRunState(id, props.state[id])}</span>);
    }
  }

  return <div>
    <h1>Stats:</h1>
    {stats}
    <h1>Error:</h1>
    {errorResults}
    <h1>Clean:</h1>
    {cleanResults}
  </div>;
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
