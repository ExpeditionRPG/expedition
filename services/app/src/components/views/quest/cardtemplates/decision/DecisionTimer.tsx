import * as React from 'react';
import {CardThemeType} from '../../../../../reducers/StateTypes';
import {getStore} from '../../../../../Store';
import Button from '../../../../base/Button';
import {LeveledSkillCheck} from './Types';

interface DecisionTimerProps extends React.Props<any> {
  checks: LeveledSkillCheck[];
  roundTimeTotalMillis: number;
  theme: CardThemeType;
  onSelect: (c: LeveledSkillCheck, elapsedMillis: number) => any;
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

  public onSelect(c: LeveledSkillCheck) {
    if (!this.interval) {
      return;
    }

    clearInterval(this.interval);
    this.interval = null;
    this.props.onSelect(c, Date.now() - this.state.startTimeMillis);
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

    const checks = this.props.checks.map((c: LeveledSkillCheck, i: number) => {
      return <Button className="bigbutton" key={i} onClick={() => this.onSelect(c)}>{c.requiredSuccesses} {c.difficulty} {c.persona} {c.skill}</Button>;
    });

    return (
      <div className={classes.join(' ')}>
        <div className="value">{formattedTimer}</div>
        <div className="secondary">{checks}</div>
      </div>
    );
  }
}
