import * as React from 'react'
import MultiTouchTrigger from './MultiTouchTrigger'

interface TimerCardProps extends React.Props<any> {
  numPlayers: number;
  roundTimeTotalMillis: number;
  onTimerStop: (elapsedMillis: number) => any;
}

export default class TimerCard extends React.Component<TimerCardProps, {}> {
  interval: any;
  state: {startTimeMillis: number, timeRemaining: number};

  constructor(props: TimerCardProps) {
    super(props)
    this.state = {startTimeMillis: Date.now(), timeRemaining: this.props.roundTimeTotalMillis};
    console.log("Starting interval");
    this.interval = setInterval(() => {
      console.log(this.props.roundTimeTotalMillis + " - " + this.state.startTimeMillis);
      this.setState({timeRemaining: this.props.roundTimeTotalMillis - (Date.now() - this.state.startTimeMillis)});
    }, 100);
  }

  onTouchChange(numFingers: number) {
    if (numFingers === this.props.numPlayers) {
      console.log("Clearing interval");
      clearInterval(this.interval);
      this.interval = null;
      this.props.onTimerStop(Date.now() - this.state.startTimeMillis);
    }
  }

  render() {
    return (
      <span>
        {this.state.timeRemaining}
        <MultiTouchTrigger onTouchChange={this.onTouchChange.bind(this)} />
      </span>
    );
  }
}