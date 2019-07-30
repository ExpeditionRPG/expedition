// This file is a quick hack and not used by external users!
// When loaded, it does a default search and runs the playtest code against all results,
// displaying any playtest errors as well as a link to the quest and the author's contact details.

import {fetchSearchResults} from 'app/actions/Search';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {connect, Provider} from 'react-redux';
import Redux, {applyMiddleware, compose, createStore} from 'redux';
import thunk from 'redux-thunk';

const cheerio: any = require('cheerio') as CheerioAPI;
const MAX_PARALLELISM = 10;

interface RunState {
  xml: string;
  messages: string[];
  started: boolean;
  complete: boolean;
  email: string;
  author: string;
  title: string;
  runtimeMillis?: number;
  runtimeLines?: number;
  totalLines: number;
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
    case 'PLAYTEST_INIT':
      state = {...state, [id]: {
        id,
        title: (action as any).title,
        email: (action as any).email,
        author: (action as any).author,
        totalLines: (action as any).totalLines,
        messages: [],
        xml: (action as any).xml,
        started: false,
        complete: false}};
      break;
    case 'PLAYTEST_START':
      state = {...state, [id]: {...state[id]}};
      state[id].started = true;
      break;
    case 'PLAYTEST_COMPLETE':
      state = {...state, [id]: {...state[id]}};
      state[id].complete = true;
      state[id].runtimeMillis = (action as any).ms;
      state[id].runtimeLines = (action as any).lines;
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

function maybeRunMoreWorkers() {
  const state = store.getState();
  const notStarted = Object.keys(state).filter((k: string) => !state[k].started);
  if (notStarted.length === 0) {
    return;
  }

  const id = notStarted[0];
  const q = state[id];
  const worker = new Worker('playtest.js');
  worker.onerror = (ev: ErrorEvent) => {
    store.dispatch({type: 'PLAYTEST_ERROR', msg: ev.error, id});
    worker.terminate();
  };
  worker.onmessage = (e: MessageEvent) => {
    if (e.data.status === 'COMPLETE') {
      store.dispatch({type: 'PLAYTEST_COMPLETE', id, ms: e.data.ms, lines: e.data.lines});
      maybeRunMoreWorkers();
    } else {
      store.dispatch({type: 'PLAYTEST_MESSAGE', msg: e.data.error, id});
    }
  };
  worker.postMessage({type: 'RUN', xml: q.xml, settings: {
    expansionhorror: true,
    expansionfuture: true,
    expansionwyrmsgiants: true,
    expansionscarredlands: true,
  }});
  console.log('started worker for quest ' + id);
  store.dispatch({
    type: 'PLAYTEST_START',
    id,
  });
}

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
      const totalLines = cheerio.load(q.xml)('[data-line]').length;
      store.dispatch({
        type: 'PLAYTEST_INIT',
        id: q.id,
        title: q.title,
        author: q.author,
        email: q.email,
        xml: q.xml,
        totalLines,
      });
    }

    for (let i = 0; i < MAX_PARALLELISM; i++) {
      maybeRunMoreWorkers();
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
      &nbsp;{(rs.complete) ? `DONE (${rs.runtimeMillis} ms, ${rs.runtimeLines}/${rs.totalLines} lines)` : '...'}
    </h3>
    <ul>
      {msgs}
    </ul>
  </div>);
}

const Main = (props: Props): JSX.Element => {
  const OVERRUN_THRESHOLD_MILLIS = 30000;

  const overruns = Object.keys(props.state)
    .filter((k: string) => props.state[k].runtimeMillis > OVERRUN_THRESHOLD_MILLIS);

  let overrunStats: JSX.Element = <span></span>;
  if (overruns.length) {
    const completion = overruns
      .filter((k: string) => props.state[k].totalLines > 0)
      .map((k: string) => props.state[k].runtimeLines / props.state[k].totalLines);
    const completionAvg = completion.reduce((a: number, b: number) => a + b) / completion.length;
    overrunStats = <span>
      <div>Fraction overran: {(100 * overruns.length / Object.keys(props.state).length).toFixed(2)}%</div>
      <div>Avg overrun coverage: {(100 * completionAvg).toFixed(2)}%</div>
    </span>;
  }

  const stats = (<div>
    <div>Quests: {Object.keys(props.state).length}</div>
    <div>Complete: {Object.keys(props.state).filter((k: string) => props.state[k].complete).length}</div>
    {overrunStats}
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
    <h1>Errors ({errorResults.length}):</h1>
    {errorResults}
    <h1>Clean ({cleanResults.length}):</h1>
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
