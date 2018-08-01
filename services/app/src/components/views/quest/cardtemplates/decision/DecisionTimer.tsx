import Button from 'app/components/base/Button';
import {CardThemeType} from 'app/reducers/StateTypes';
import {getStore} from 'app/Store';
import * as React from 'react';
import {DecisionType} from './Types';

interface DecisionTimerProps extends React.Props<any> {
  decisions: DecisionType[];
  roundTimeTotalMillis: number;
  theme: CardThemeType;
  onDecision: (d: DecisionType, elapsedMillis: number) => any;
}

export default class DecisionTimer extends React.Component<DecisionTimerProps, {}> {
  public interval: any;
  public state: {startTimeMillis: number, timeRemaining: number};

  constructor(props: DecisionTimerProps) {
    super(props);
    this.state = {startTimeMillis: Date.now(), timeRemaining: this.props.roundTimeTotalMillis};
    this.interval = setInterval(() => {
      this.setState({timeRemaining: this.props.roundTimeTotalMillis - (Date.now() - this.state.startTimeMillis)});
    }, 100);
  }

  public onChoice(d: DecisionType) {
    if (!this.interval) {
      return;
    }

    clearInterval(this.interval);
    this.interval = null;
    this.props.onDecision(d, Date.now() - this.state.startTimeMillis);
  }

  public componentWillUnmount() {
    // Multiplayer play may unmount this component without a touch event.
    // This makes sure our timer eventually stops.
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  public render() {
    let formattedTimer: string;
    const timeRemainingSec = this.state.timeRemaining / 1000;
    if (timeRemainingSec < 10 && timeRemainingSec > 0) {
      formattedTimer = timeRemainingSec.toFixed(1);
    } else {
      formattedTimer = timeRemainingSec.toFixed(0);
    }
    formattedTimer += 's';

    const cardTheme = this.props.theme || 'light';
    const questTheme = getStore().getState().quest.details.theme || 'base';
    const classes = ['no_icon', 'base_card', 'base_timer_card', 'card_theme_' + cardTheme, 'quest_theme_' + questTheme];

    const decisions = this.props.decisions.map((d: DecisionType, i: number) => {
      return <Button className="bigbutton" key={i} onClick={() => this.onChoice(d)}>{d.numAttempts} {d.difficulty} {d.persona} {d.skill}</Button>;
    });

    return (
      <div className={classes.join(' ')}>
        <div className="value">{formattedTimer}</div>
        <div className="secondary">{decisions}</div>
      </div>
    );
  }
}
