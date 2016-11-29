import * as React from 'react'
import MultiTouchTrigger from './MultiTouchTrigger'
import theme from '../../theme'

interface TimerCardProps extends React.Props<any> {
  numPlayers: number;
  surgeWarning: boolean;
  roundTimeTotalMillis: number;
  dark: boolean;
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

  render() {
    let timeRemainingSec = this.state.timeRemaining / 1000;
    var formattedTimer: string;
    if (timeRemainingSec < 10 && timeRemainingSec > 0) {
      formattedTimer = timeRemainingSec.toFixed(1);
    }
    else {
      formattedTimer = timeRemainingSec.toFixed(0);
    }
    var surgeWarning = (this.props.surgeWarning) ? (<h3 className="surge_warning">Surge Imminent</h3>) : (<span></span>);
    return (
      <div className={"base_timer_card" + ((this.props.dark) ? " dark" : "")}>
        <div className="value">{formattedTimer}s</div>
        {surgeWarning}
        <MultiTouchTrigger onTouchChange={this.onTouchChange.bind(this)} />
      </div>
    );
  }
}