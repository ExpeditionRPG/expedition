import * as React from 'react'
import * as ReactDOM from 'react-dom'
import CircleRipple from 'material-ui/internal/CircleRipple'
import {InteractionEvent} from 'expedition-qdl/lib/multiplayer/Events'
import MultiplayerAffector from './MultiplayerAffector'

const ReactTransitionGroup = require('react-transition-group/TransitionGroup');

// Remove the first element of the array
const shift = ([, ...newArray]) => newArray;

// MultiplayerRipple is copied with modifications from
// https://github.com/callemall/material-ui/blob/master/src/internal/TouchRipple.js
export interface MultiplayerRippleProps {
  opacity?: number;
  children: JSX.Element;
  id?: string;
  remoteID?: string;
  className?: string;
}
export interface MultiplayerRippleState {
  hasRipples: boolean;
  nextKey: number;
  ripples: JSX.Element[];
}
export default class MultiplayerRipple extends React.Component<MultiplayerRippleProps, MultiplayerRippleState> {
  private ignoreNextMouseDown: boolean;
  private startTime: number;
  private firstTouchY: number;
  private firstTouchX: number;

  constructor(props: MultiplayerRippleProps) {
    super(props);

    this.state = {
      // This prop allows us to only render the ReactTransitionGroup
      // on the first click of the component, making the inital render faster.
      hasRipples: false,
      nextKey: 0,
      ripples: [],
    };
  }

  handle(client: string, e: InteractionEvent) {
    // TODO keep start/end hashed by client, apply client color
    if (this.props.remoteID === null || e.event === 'touchmove' || e.id !== this.props.remoteID) {
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

  start(posX: number, posY: number, color: string) {

    let ripples = this.state.ripples;

    // Add a ripple to the ripples array
    ripples = [...ripples, (
      <CircleRipple
        key={this.state.nextKey}
        style={this.getRippleStyle(posX, posY)}
        color={color}
        opacity={this.props.opacity || 1.0}
      />
    )];

    this.setState({
      hasRipples: true,
      nextKey: this.state.nextKey + 1,
      ripples: ripples,
    });
  }

  end() {
    const currentRipples = this.state.ripples;
    this.setState({
      ripples: shift(currentRipples),
    });
  }

  getRippleStyle(posX: number, posY: number) {
    const el = ReactDOM.findDOMNode(this);
    const elHeight = (el as any).offsetHeight;
    const elWidth = (el as any).offsetWidth;
    const realX = elWidth * (posX/1000);
    const realY = elHeight * (posY/1000);
    const topLeftDiag = this.calcDiag(realX, realY);
    const topRightDiag = this.calcDiag(elWidth - realX, realY);
    const botRightDiag = this.calcDiag(elWidth - realX, elHeight - realY);
    const botLeftDiag = this.calcDiag(realX, elHeight - realY);
    const rippleRadius = Math.sqrt(Math.max(
      topLeftDiag, topRightDiag, botRightDiag, botLeftDiag
    ));

    const rippleSize = rippleRadius * 2;
    const left = realX - rippleRadius;
    const top = realY - rippleRadius;

    return {
      directionInvariant: true,
      height: rippleSize,
      width: rippleSize,
      top,
      left,
    };
  }

  calcDiag(a: any, b: any) {
    return (a * a) + (b * b);
  }

  render() {
    let rippleGroup: JSX.Element|null = null;
    if (this.state.hasRipples) {
      const style = {
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1, // This is also needed so that ripples do not bleed past a parent border radius.
      };
      rippleGroup = (
        <ReactTransitionGroup style={style}>
          {this.state.ripples}
        </ReactTransitionGroup>
      );
    }

    return (
      <MultiplayerAffector
        id={this.props.id}
        remoteID={this.props.remoteID}
        className={this.props.className}
        onInteraction={(c: string, i: InteractionEvent) => {this.handle(c, i)}}>
        {rippleGroup}
        {this.props.children}
      </MultiplayerAffector>
    );
  }
}
