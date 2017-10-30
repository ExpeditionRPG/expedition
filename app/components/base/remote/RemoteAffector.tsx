import * as React from 'react'
import {InteractionEvent, RemotePlayEvent} from 'expedition-qdl/lib/remote/Events'
import {getRemotePlayClient} from '../../../RemotePlay'

// Listens to remote play client published events and forwards InteractionEvents
// to the inheriting class.
// Also listens for touch events on this component and transmits them.
export interface RemoteAffectorProps {
  remoteID?: string; // TODO MAKE REQUIRED
  abortOnScroll?: boolean;
  includeLocalInteractions?: boolean;
  onInteraction?: (client: string, event: InteractionEvent) => any;
  children: any;
  id?: string;
  className?: string;
}
export default class RemoteAffector extends React.Component<RemoteAffectorProps,{}> {
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

    const xyArray: {[id: string]: number[]} = {};
    for (let i = 0; i < e.touches.length; i++) {
      xyArray[e.touches[i].identifier] = [e.touches[i].clientX, e.touches[i].clientY];
    }
    this.processInput(e.type, xyArray);
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
    this.processInput('touchstart', {0: [e.layerX, e.layerY]});
  }

  private mouseMoveEvent(e: MouseEvent) {
    if (this.mouseDown) {
      this.processInput('touchmove', {0: [e.layerX, e.layerY]});
    }
  }

  private mouseUpEvent() {
    console.log('MouseUP');
    this.mouseDown = false;
    this.processInput('touchend', {});
  }

  private processInput(type: string, positions: {[id: string]: number[]}) {
    const boundingRect = this.ref.getBoundingClientRect();
    for (const k of Object.keys(positions)) {
      positions[k][0] = Math.floor((positions[k][0] - boundingRect.left) / this.ref.offsetWidth * 1000);
      positions[k][1] = Math.floor((positions[k][1] - boundingRect.top) / this.ref.offsetHeight * 1000);
    }
    const e: InteractionEvent = {type: 'INTERACTION', positions, id: this.props.remoteID, event: type};

    // Don't send move events over remote play.
    // Our implementation does not allow high-frequency value updates.
    if (type !== 'touchmove') {
      getRemotePlayClient().sendEvent(e);
    }

    if (this.props.includeLocalInteractions) {
      this.props.onInteraction('local', e);
    }
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
        className={this.props.className + ' remote-affector'}
        style={{touchAction: 'pan-y'}}
        ref={(r: HTMLElement) => {this.onRef(r)}}>
        {this.props.children}
      </div>
    );
  }
}
