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
  style: any;

  constructor(props: TimerCardProps) {
    super(props)
    this.state = {startTimeMillis: Date.now(), timeRemaining: this.props.roundTimeTotalMillis};
    console.log("Starting interval");
    this.interval = setInterval(() => {
      console.log(this.props.roundTimeTotalMillis + " - " + this.state.startTimeMillis);
      this.setState({timeRemaining: this.props.roundTimeTotalMillis - (Date.now() - this.state.startTimeMillis)});
    }, 100);

    this.style = {
      container: {
        width: '100%',
        height: '100%',
        backgroundColor: (this.props.dark) ? 'black' : 'inherit',
      },
      timerValue: {
        fontSize: '110px',
        fontFamily: theme.card.headerFont,
        textAlign: 'center',
        position: 'absolute',
        width: '100%',
        top: '50%',
        marginTop: '-55px',
        color: (this.props.dark) ? 'white' : 'inherit',
      },
      surgeWarning: {
        textAlign: 'center',
        position: 'absolute',
        width: '100%',
        top: '60%',
        color: (this.props.dark) ? 'white' : 'inherit',
      }
    }
  }

  onTouchChange(numFingers: number) {
    if (!this.interval) {
      return;
    }

    if (numFingers === this.props.numPlayers) {
      console.log("Clearing interval");
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
    var surgeWarning = (this.props.surgeWarning) ? (<h3 style={this.style.surgeWarning}>Surge Imminent</h3>) : (<span></span>);
    return (
      <div style={this.style.container}>
        <div style={this.style.timerValue}>{formattedTimer}s</div>
        {surgeWarning}
        <MultiTouchTrigger onTouchChange={this.onTouchChange.bind(this)} />
      </div>
    );
  }
}