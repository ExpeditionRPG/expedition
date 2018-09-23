import Button from 'app/components/base/Button';
import {getStore} from 'app/Store';
import * as React from 'react';
import {ParserNode} from '../TemplateTypes';
import {extractDecision} from './Actions';
import {LeveledSkillCheck, StateProps as StatePropsBase} from './Types';

export interface StateProps extends StatePropsBase {
  roundTimeTotalMillis: number;
}

export interface DispatchProps {
  onSelect: (node: ParserNode, selected: LeveledSkillCheck, elapsedMillis: number) => any;
}

export interface Props extends StateProps, DispatchProps {}

// Credit: https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
function getRandomSubarray<T>(arr: T[], size: number, rng: () => number) {
    const shuffled = arr.slice(0);
    let i = arr.length;
    const min = i - size;
    while (i-- > min) {
        const index = Math.floor((i + 1) * rng());
        const temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

export default class DecisionTimer extends React.Component<Props, {}> {
  public interval: any;
  public state: {startTimeMillis: number, timeRemaining: number};
  private showPersona: boolean;
  private checks: LeveledSkillCheck[];

  constructor(props: Props) {
    super(props);
    this.state = {startTimeMillis: Date.now(), timeRemaining: this.props.roundTimeTotalMillis};
    this.interval = setInterval(() => {
      this.setState({timeRemaining: this.props.roundTimeTotalMillis - (Date.now() - this.state.startTimeMillis)});
    }, 100);

    // Set on single evaluation
    this.showPersona = this.props.rng() > 0.5;
    this.checks = this.selectChecks();
  }

  public onSelect(c: LeveledSkillCheck) {
    if (!this.interval) {
      return;
    }

    clearInterval(this.interval);
    this.interval = null;
    this.props.onSelect(this.props.node, c, Date.now() - this.state.startTimeMillis);
  }

  public componentWillUnmount() {
    // Multiplayer play may unmount this component without a touch event.
    // This makes sure our timer eventually stops.
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  public selectChecks(): LeveledSkillCheck[] {
    const decision = extractDecision(this.props.node);
    const cs = decision.leveledChecks;
    if (cs.length === 0) {
      console.error('Could not resolve any checks, using generated checks');
      return [];
    }

    const mapped: {[k: string]: LeveledSkillCheck[]} = {};
    for (const c of cs) {
      const k = `${c.persona} ${c.skill}`;
      if (!mapped[k]) {
        mapped[k] = [];
      }
      mapped[k].push(c);
    }

    const keys = Object.keys(mapped);
    if (keys.length > 3) {
      getRandomSubarray(Object.keys(mapped), 3, this.props.rng);
    }
    return keys.map((k) => {
        return mapped[k][Math.floor(this.props.rng() * mapped[k].length)];
      });
  }

  private formattedTimer(): string {
    let formattedTimer: string;
    const timeRemainingSec = this.state.timeRemaining / 1000;
    if (timeRemainingSec < 10 && timeRemainingSec > 0) {
      formattedTimer = timeRemainingSec.toFixed(1);
    } else {
      formattedTimer = timeRemainingSec.toFixed(0);
    }
    return formattedTimer + 's';
  }

  public render() {

    const questTheme = getStore().getState().quest.details.theme || 'base';
    const checks = this.checks.map((c, i: number): JSX.Element => {
      return <Button key={i} onClick={() => this.onSelect(c)}>{c.requiredSuccesses} {(this.showPersona) ? c.persona : c.difficulty} {c.skill}</Button>;
    });
    return (
      <div className={['no_icon', 'base_card', 'base_timer_card', 'card_theme_' + this.props.theme, 'quest_theme_' + questTheme].join(' ')}>
        <div className="value">{this.formattedTimer()}</div>
        <div className="secondary">{checks}</div>
      </div>
    );
  }
}
