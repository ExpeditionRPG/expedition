import * as React from 'react'
import {Provider} from 'react-redux'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'

import AudioContainer from './AudioContainer'
import DialogsContainer from './DialogsContainer'
import ToolsContainer from '../ToolsContainer'
import FeaturedQuestsContainer from '../FeaturedQuestsContainer'
import PlayerCountSettingContainer from '../PlayerCountSettingContainer'
import ReportContainer from '../ReportContainer'
import SearchContainer from '../SearchContainer'
import SettingsContainer from '../SettingsContainer'
import SplashScreenContainer from '../SplashScreenContainer'
import QuestStartContainer from '../QuestStartContainer'
import QuestEndContainer from '../QuestEndContainer'
import RemotePlayContainer from '../RemotePlayContainer'

import RemoteTouchPanel from './RemoteTouchPanel'

import {renderCardTemplate} from '../../cardtemplates/Template'
import {initialSettings} from '../../reducers/Settings'
import {closeSnackbar} from '../../actions/Snackbar'
import {initialState} from '../../reducers/Snackbar'
import {AppStateWithHistory, TransitionType, SearchPhase, RemotePlayPhase, SettingsType, SnackbarState} from '../../reducers/StateTypes'
import {getStore} from '../../Store'
import {getRemotePlayClient} from '../../RemotePlay'

const ReactCSSTransitionGroup: any = require('react-addons-css-transition-group');

interface MainProps extends React.Props<any> {}

class TouchIntercepter<P, S> extends React.Component<P, S> {
  private ref: HTMLElement;
  private boundingRect: ClientRect;
  private listeners: {[k: string]: () => void};
  mouseDown: Boolean;

  constructor(props: P) {
    super(props);
    this.listeners = {
      'touchstart': this.touchEvent.bind(this),
      'touchmove': this.touchEvent.bind(this),
      'touchend': this.touchEvent.bind(this),
      'mousedown': this.mouseDownEvent.bind(this),
      'mousemove': this.mouseMoveEvent.bind(this),
      'mouseup': this.mouseUpEvent.bind(this),
    };
  }

  private touchEvent(e: any) {
    const xyArray: number[][] = Array(e.touches.length);
    const boundingRect = this.ref.getBoundingClientRect();
    for (let i = 0; i < e.touches.length; i++) {
      xyArray[i] = [
        (e.touches[i].clientX - boundingRect.left) / this.ref.offsetWidth * 100,
        (e.touches[i].clientY - boundingRect.top) / this.ref.offsetHeight * 100
      ];
    }
    this.processInput(xyArray);
  }

  private mouseDownEvent(e: any) {
    this.mouseDown = true;
    const boundingRect = this.ref.getBoundingClientRect();
    this.processInput([[e.layerX, e.layerY]]);
  }

  private mouseMoveEvent(e: any) {
    if (this.mouseDown) {
      const boundingRect = this.ref.getBoundingClientRect();
      this.processInput([[
        (e.layerX - boundingRect.left) / this.ref.offsetWidth * 100,
        (e.layerY - boundingRect.top) / this.ref.offsetHeight * 100
      ]]);
    }
  }

  private mouseUpEvent() {
    this.mouseDown = false;
    this.processInput([]);
  }

  private processInput(positions: number[][]) {
    getRemotePlayClient().sendEvent({type: 'TOUCH', positions});
  }

  subscribeInterceptingElement(r: HTMLElement) {
    if (!r || process.env.NODE_ENV !== 'dev') {
      return;
    }
    this.ref = r;
    for (const k of Object.keys(this.listeners)) {
      // The `true` arg ensures touch events are propagated here during
      // the "capture" phase of event flow.
      // https://www.w3.org/TR/DOM-Level-3-Events/#event-flow
      this.ref.addEventListener(k, this.listeners[k], true);
    }
  }

  componentWillUnmount() {
    if (!this.ref) {
      return;
    }

    for (const k of Object.keys(this.listeners)) {
      this.ref.removeEventListener(k, this.listeners[k], true);
    }
  }
}

export default class Main extends TouchIntercepter<MainProps, {}> {
  state: {
    card: JSX.Element,
    key: number,
    transition: TransitionType,
    settings: SettingsType,
    snackbar: SnackbarState,
  };
  storeUnsubscribeHandle: () => any;

  constructor(props: MainProps) {
    super(props);
    this.state = this.getUpdatedState();
    this.storeUnsubscribeHandle = getStore().subscribe(this.handleChange.bind(this));
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    // 2017-08-16: Failing to unsubscribe here is likely to have caused unnecessary references to previous
    // JS objects, which prevents garbage collection and causes runaway memory consumption.
    this.storeUnsubscribeHandle();
  }

  getUpdatedState() {
    const state: AppStateWithHistory = getStore().getState();
    if (state === undefined || this.state === undefined || Object.keys(state).length === 0) {
      return {
        card: <SplashScreenContainer/>,
        key: 0,
        transition: 'INSTANT' as TransitionType,
        settings: initialSettings,
        snackbar: initialState,
      };
    }

    if (state.snackbar.open !== this.state.snackbar.open) {
      return {...this.state, snackbar: state.snackbar};
    }

    // After this point, only naviation-related state changes will result in a state change
    if (!state.card || (this.state && state.card.ts === this.state.key)) {
      return this.state;
    }

    let card: JSX.Element = null;
    switch(state.card.name) {
      case 'SPLASH_CARD':
        card = <SplashScreenContainer/>;
        break;
      case 'PLAYER_COUNT_SETTING':
        card = <PlayerCountSettingContainer/>;
        break;
      case 'FEATURED_QUESTS':
        card = <FeaturedQuestsContainer/>;
        break;
      case 'QUEST_START':
        card = <QuestStartContainer/>;
        break;
      case 'QUEST_CARD':
        if (!state.quest || !state.quest.node) {
          return this.state;
        }
        card = renderCardTemplate(state.card, state.quest.node);
        if (!card) {
          console.log('Unknown quest card name ' + name);
          return this.state;
        }
        break;
      case 'QUEST_END':
        card = <QuestEndContainer/>;
        break;
      case 'ADVANCED':
        card = <ToolsContainer />;
        break;
      case 'SEARCH_CARD':
        card = <SearchContainer phase={state.card.phase as SearchPhase} />;
        break;
      case 'SETTINGS':
        card = <SettingsContainer />;
        break;
      case 'REPORT':
        card = <ReportContainer />;
        break;
      case 'REMOTE_PLAY':
        card = <RemotePlayContainer phase={state.card.phase as RemotePlayPhase} />;
        break;
      default:
        throw new Error('Unknown card ' + state.card.name);
    }

    let transition: TransitionType = 'NEXT';
    if (state._return) {
      transition = 'PREV';
    } else if (state.card.name === 'SPLASH_CARD') {
      transition = 'INSTANT';
    }

    return {
      card,
      key: state.card.ts,
      transition,
      settings: state.settings,
      snackbar: state.snackbar
    };
  }

  handleChange() {
    // TODO: Handle no-op on RESET_APP from IDE
    this.setState(this.getUpdatedState());
  }

  render() {
    let containerClass = 'app_container ';
    if (this.state.settings.fontSize === 'SMALL') {
      containerClass += 'smallFont';
    } else if (this.state.settings.fontSize === 'LARGE') {
      containerClass += 'largeFont';
    }

    const cards: any = [
      <div className="base_main" key={this.state.key} ref={(r: HTMLElement) => this.subscribeInterceptingElement(r)}>
        {this.state.card}
        <RemoteTouchPanel/>
      </div>
    ];

    return (
      <div className={containerClass}>
        <Provider store={getStore()}>
          <ReactCSSTransitionGroup
            transitionName={this.state.transition}
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}>
            {cards}
            <DialogsContainer />
            <Snackbar
              className="snackbar"
              open={this.state.snackbar.open}
              message={this.state.snackbar.message}
              autoHideDuration={this.state.snackbar.timeout}
              onRequestClose={() => getStore().dispatch(closeSnackbar())}
            />
            <AudioContainer />
          </ReactCSSTransitionGroup>
        </Provider>
      </div>
    );
  }
}
