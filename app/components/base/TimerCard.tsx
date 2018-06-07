import * as React from 'react'
import MultiTouchTrigger from './MultiTouchTrigger'
import {CardThemeType} from '../../reducers/StateTypes'
import {MultiplayerState} from '../../reducers/StateTypes'
import {getMultiplayerClient} from '../../Multiplayer'
import {getStore} from '../../Store'

interface TimerCardProps extends React.Props<any> {
  numPlayers: number;
  secondaryText?: string;
  tertiaryText?: string;
  icon?: string;
  roundTimeTotalMillis: number;
  theme: CardThemeType;
  remotePlayState?: MultiplayerState;
  onTimerStop: (elapsedMillis: number) => any;
}

export default class TimerCard extends React.Component<TimerCardProps, {}> {
  interval: any;
  state: {startTimeMillis: number, timeRemaining: number};

  constructor(props: TimerCardProps) {
    super(props)
    this.state = {startTimeMillis: Date.now(), timeRemaining: this.props.roundTimeTotalMillis};
    this.interval = setInterval(() => {
      this.setState({timeRemaining: this.props.roundTimeTotalMillis - (Date.now() - this.state.startTimeMillis)});
    }, 100);
  }

  onTouchChange(numFingers: number) {
    if (!this.interval) {
      return;
    }

    if (numFingers === this.props.numPlayers) {
      clearInterval(this.interval);
      this.interval = null;
      this.props.onTimerStop(Date.now() - this.state.startTimeMillis);
    }
  }

  componentWillUnmount() {
    // Multiplayer play may unmount this component without a touch event.
    // This makes sure our timer eventually stops.
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render() {
    let unheldClientCount = 0;
    let timerHeld = false;
    if (this.props.remotePlayState && this.props.remotePlayState.clientStatus) {
      const rpClientID = getMultiplayerClient().getClientKey();
      for (const client of Object.keys(this.props.remotePlayState.clientStatus)) {
        const clientStatus = this.props.remotePlayState.clientStatus[client];
        if (!clientStatus.connected) {
          continue;
        }
        const waitingOn = clientStatus.waitingOn;
        const waitingOnTimer = (waitingOn && waitingOn.type === 'TIMER') || false;
        if (client === rpClientID) {
          timerHeld = waitingOnTimer;
        } else if (!waitingOnTimer) {
          unheldClientCount++;
        }
      }
    }

    let formattedTimer: string;
    let secondaryText = this.props.secondaryText;
    let tertiaryText = this.props.tertiaryText;

    if (timerHeld) {
      if (unheldClientCount > 0) {
        formattedTimer = unheldClientCount.toString();
        secondaryText = 'waiting on peers';
        tertiaryText = '';
      } else {
        formattedTimer = '';
        secondaryText = '';
        tertiaryText = 'waiting for server...';
      }
    } else {
      const timeRemainingSec = this.state.timeRemaining / 1000;
      if (timeRemainingSec < 10 && timeRemainingSec > 0) {
        formattedTimer = timeRemainingSec.toFixed(1);
      }
      else {
        formattedTimer = timeRemainingSec.toFixed(0);
      }
      formattedTimer += 's';
    }

    const cardTheme = this.props.theme || 'light';
    const questTheme = getStore().getState().quest.details.theme || 'base';
    const classes = ['base_timer_card', 'card_theme_' + cardTheme, 'quest_theme_' + questTheme];
    if (!this.props.icon) {
      classes.push('no_icon');
    }

    return (
      <div className={classes.join(' ')}>
        {this.props.icon && <div className="timer_icon_wrapper">
          <img className="timer_icon" src={'images/' + this.props.icon + '_white.svg'} />
        </div>}
        <div className="value">{formattedTimer}</div>
        {secondaryText && <div className="secondary">{secondaryText}</div>}
        {tertiaryText && <div className="tertiary">{tertiaryText}</div>}
        {!timerHeld && <MultiTouchTrigger onTouchChange={this.onTouchChange.bind(this)} />}
      </div>
    );
  }
}
