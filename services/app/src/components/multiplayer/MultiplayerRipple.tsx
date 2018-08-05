import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {TransitionGroup} from 'react-transition-group';
import {InteractionEvent} from 'shared/multiplayer/Events';
import MultiplayerAffector from './MultiplayerAffector';
import Ripple from './Ripple';

// Remove the first element of the array
const shift = ([, ...newArray]) => newArray;

// MultiplayerRipple is copied with modifications from
// https://github.com/callemall/material-ui/blob/master/src/internal/TouchRipple.js
export interface Props {
  opacity?: number;
  children: JSX.Element;
  id?: string;
  className?: string;
}

export interface State {
  hasRipples: boolean;
  nextKey: number;
  ripples: JSX.Element[];
}

export default class MultiplayerRipple extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      // This prop allows us to only render the ReactTransitionGroup
      // on the first click of the component, making the inital render faster.
      hasRipples: false,
      nextKey: 0,
      ripples: [],
    };
  }

  public handle(client: string, e: InteractionEvent) {
    // TODO keep start/end hashed by client, apply client color
    if (this.props.id === null || e.event === 'touchmove' || e.id !== this.props.id) {
      return;
    }
    switch (e.event) {
      case 'touchstart':
        return this.start(e.positions[0][0], e.positions[0][1], 'red');
      case 'touchend':
        return this.end();
      default:
        return;
    }
  }

  public componentDidCatch(error: any, info: any) {
    console.error(error);
    console.info(info);
  }

  public start(posX: number, posY: number, color: string) {
    const el = ReactDOM.findDOMNode(this);
    const elHeight = (el as any).offsetHeight;
    const elWidth = (el as any).offsetWidth;
    const realX = elWidth * (posX / 1000);
    const realY = elHeight * (posY / 1000);
    const topLeftDiag = this.calcDiag(realX, realY);
    const topRightDiag = this.calcDiag(elWidth - realX, realY);
    const botRightDiag = this.calcDiag(elWidth - realX, elHeight - realY);
    const botLeftDiag = this.calcDiag(realX, elHeight - realY);
    const rippleRadius = Math.sqrt(Math.max(
      topLeftDiag, topRightDiag, botRightDiag, botLeftDiag
    ));

    const ripple: JSX.Element = (
      <Ripple
        key={this.state.nextKey}
        rippleX={realX}
        rippleY={realY}
        rippleSize={rippleRadius * 2}
        classes={{
          ripple: {
            color,
            opacity: (this.props.opacity || 1.0),
          },
        }}
      />
    );

    // Add a ripple to the ripples array
    this.setState({
      hasRipples: true,
      nextKey: this.state.nextKey + 1,
      ripples: [...this.state.ripples, ripple],
    });
  }

  public end() {
    const currentRipples = this.state.ripples;
    this.setState({
      ripples: shift(currentRipples),
    });
  }

  public calcDiag(a: any, b: any) {
    return (a * a) + (b * b);
  }

  public render() {
    let rippleGroup: JSX.Element|null = null;
    if (this.state.hasRipples) {
      rippleGroup = (
        <TransitionGroup component="span" className="multiplayer_ripple">
          {this.state.ripples}
        </TransitionGroup>
      );
    }

    return (
      <MultiplayerAffector
        id={this.props.id}
        className={this.props.className}
        onInteraction={(c: string, i: InteractionEvent) => {this.handle(c, i); }}>
        {rippleGroup}
        {this.props.children}
      </MultiplayerAffector>
    );
  }
}
