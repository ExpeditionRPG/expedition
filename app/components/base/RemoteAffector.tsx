import * as React from 'react'
import * as ReactDOM from 'react-dom'
import CircleRipple from 'material-ui/internal/CircleRipple'
import {InteractionEvent, RemotePlayEvent} from 'expedition-qdl/lib/remote/Events'
import {getRemotePlayClient} from '../../RemotePlay'

const ReactTransitionGroup = require('react-transition-group/TransitionGroup');

// Listens to remote play client published events and forwards InteractionEvents
// to the inheriting class.
// Also listens for touch events on this component and transmits them.
export interface RemoteAffectorProps {
  remoteID?: string; // TODO MAKE REQUIRED
  abortOnScroll?: boolean;
  onInteraction?: (client: string, event: InteractionEvent) => any;
  children: any;
  id?: string;
  className?: string;
}
export class RemoteAffector extends React.Component<RemoteAffectorProps,{}> {
  private listeners: {[k: string]: (e: any)=>any};
  private ignoreNextMouseDown: boolean;
  private boundHandleRemotePlayEvent: (e: RemotePlayEvent) => void;
  private mouseDown: boolean;
  private ref: HTMLElement;


  constructor(props: RemoteAffectorProps) {
    super(props);

    // Touch start produces a mouse down event for compat reasons. To avoid
    // showing ripples twice we skip showing a ripple for the first mouse down
    // after a touch start. Note we don't store ignoreNextMouseDown in this.state
    // to avoid re-rendering when we change it.
    this.ignoreNextMouseDown = false;
    this.mouseDown = false;
    this.boundHandleRemotePlayEvent = this.handleRemotePlayEvent.bind(this);
    getRemotePlayClient().subscribe(this.boundHandleRemotePlayEvent);
    this.listeners = {
      'touchstart': this.touchEvent.bind(this),
      'touchmove': this.touchEvent.bind(this),
      'touchend': this.touchEvent.bind(this),
      'mousedown': this.mouseDownEvent.bind(this),
      'mousemove': this.mouseMoveEvent.bind(this),
      'mouseup': this.mouseUpEvent.bind(this),
    };
  }

  private handleRemotePlayEvent(e: RemotePlayEvent) {
    if (e.event.type !== 'INTERACTION' || e.event.id !== this.props.remoteID) {
      return;
    }
    this.props.onInteraction(e.client, e.event);
  }

  private touchEvent(e: TouchEvent) {
    // TODO: Add scroll abort from
    // https://github.com/callemall/material-ui/blob/master/src/internal/TouchRipple.js


    if (e.type === 'touchstart') {
      console.log('TOUCH START');
      this.ignoreNextMouseDown = true;
    }

    /*
    // TODO: Figure out why this significantly slows down touch bubbling
    const xyArray: number[][] = Array(e.touches.length);
    for (let i = 0; i < e.touches.length; i++) {
      xyArray[i] = [e.touches[i].clientX, e.touches[i].clientY, e.touches[i].identifier];
    }
    this.processInput(e.type, xyArray);
    */
  }

  private mouseDownEvent(e: MouseEvent) {
    if (this.ignoreNextMouseDown) {
      this.ignoreNextMouseDown = false;
      return;
    }
    // only listen to left clicks
    if (e.button !== 0) {
      return;
    }
    this.mouseDown = true;
    this.processInput('touchstart', [[e.layerX, e.layerY, 0]]);
  }

  private mouseMoveEvent(e: MouseEvent) {
    if (this.mouseDown) {
      this.processInput('touchmove', [[e.layerX, e.layerY, 0]]);
    }
  }

  private mouseUpEvent() {
    this.mouseDown = false;
    this.processInput('touchend', []);
  }

  private processInput(type: string, positions: number[][]) {
    const boundingRect = this.ref.getBoundingClientRect();
    for (let i = 0; i < positions.length; i++) {
      positions[i][0] = Math.floor((positions[i][0] - boundingRect.left) / this.ref.offsetWidth * 1000);
      positions[i][1] = Math.floor((positions[i][1] - boundingRect.top) / this.ref.offsetHeight * 1000);
    }
    getRemotePlayClient().sendEvent({type: 'INTERACTION', positions, id: this.props.remoteID, event: type});
  }

  onRef(r: HTMLElement) {
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
    getRemotePlayClient().unsubscribe(this.boundHandleRemotePlayEvent);

    if (!this.ref) {
      return;
    }
    for (const k of Object.keys(this.listeners)) {
      this.ref.removeEventListener(k, this.listeners[k], true);
    }
  }

  render() {
    return (
      <div
        id={this.props.id}
        className={this.props.className}
        ref={(r: HTMLElement) => {this.onRef(r)}}>
        {this.props.children}
      </div>
    );
  }
}

// Remove the first element of the array
const shift = ([, ...newArray]) => newArray;

// RemoteRipple is copied with modifications from
// https://github.com/callemall/material-ui/blob/master/src/internal/TouchRipple.js
export interface RemoteRippleProps {
  opacity?: number;
  children: JSX.Element;
  id?: string;
  remoteID?: string;
  className?: string;
}
export interface RemoteRippleState {
  hasRipples: boolean;
  nextKey: number;
  ripples: JSX.Element[];
}
export class RemoteRipple extends React.Component<RemoteRippleProps, RemoteRippleState> {
  private ignoreNextMouseDown: boolean;
  private startTime: number;
  private firstTouchY: number;
  private firstTouchX: number;

  constructor(props: RemoteRippleProps) {
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

    if (e.event === 'touchmove') {
      return;
    }

    console.log(client + ' TODO: ' + JSON.stringify(e));
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
    let rippleGroup: JSX.Element;
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
      <RemoteAffector
        id={this.props.id}
        remoteID={this.props.remoteID}
        className={this.props.className}
        onInteraction={(c: string, i: InteractionEvent) => {this.handle(c, i)}}>
        {rippleGroup}
        {this.props.children}
      </RemoteAffector>
    );
  }
}
