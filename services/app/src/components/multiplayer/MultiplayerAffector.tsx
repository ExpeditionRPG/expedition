import * as React from 'react';
import {InteractionEvent, MultiplayerEvent, MultiplayerEventBody} from 'shared/multiplayer/Events';

export interface StateProps {
  id?: string;
  abortOnScroll?: boolean;
  children: any;
  className?: string;
  includeLocalInteractions?: boolean;
  onInteraction?: (client: string, event: InteractionEvent) => any;
  lazy?: boolean;
}

export interface DispatchProps {
  onEvent: (e: MultiplayerEventBody) => void;
  onSubscribe: (handler: (e: MultiplayerEvent) => void) => void;
  onUnsubscribe: (handler: (e: MultiplayerEvent) => void) => void;
}

export interface Props extends StateProps, DispatchProps {}

// Listens to multiplayer client published events and forwards InteractionEvents
// to the inheriting class.
// Also listens for touch events on this component and transmits them.
export default class MultiplayerAffector extends React.Component<Props, {}> {
  private listeners: {[k: string]: (e: any) => any};
  private ignoreNextMouseDown: boolean;
  private boundHandleMultiplayerEvent: (e: MultiplayerEvent) => void;
  private mouseDown: boolean;
  private ref: HTMLElement;
  private boundingRect: any;

  constructor(props: Props) {
    super(props);

    // Touch start produces a mouse down event for compat reasons. To avoid
    // showing ripples twice we skip showing a ripple for the first mouse down
    // after a touch start. Note we don't store ignoreNextMouseDown in this.state
    // to avoid re-rendering when we change it.
    this.ignoreNextMouseDown = false;
    this.mouseDown = false;
    this.boundHandleMultiplayerEvent = (e: MultiplayerEvent) => this.handleMultiplayerEvent(e);
    this.props.onSubscribe(this.boundHandleMultiplayerEvent);
    if (this.props.lazy) {
      // Event listener registration is expensive (several milliseconds per call to addEventListener).
      // This won't show any moves or "up" events.
      this.listeners = {
        mousedown: (e: MouseEvent) => this.mouseDownEvent(e),
        touchstart: (e: TouchEvent) => this.touchEvent(e),
      };
    } else {
      this.listeners = {
        mousedown: (e: MouseEvent) => this.mouseDownEvent(e),
        mousemove: (e: MouseEvent) => this.mouseMoveEvent(e),
        mouseup: () => this.mouseUpEvent(),
        touchend: (e: TouchEvent) => this.touchEvent(e),
        touchmove: (e: TouchEvent) => this.touchEvent(e),
        touchstart: (e: TouchEvent) => this.touchEvent(e),
      };
    }
    this.boundingRect = null;
  }

  private handleMultiplayerEvent(e: MultiplayerEvent) {
    if (e.event.type !== 'INTERACTION' || e.event.id !== this.props.id) {
      return;
    }
    if (this.props.onInteraction) {
      this.props.onInteraction(e.client + '|' + e.instance, e.event);
    }
  }

  private touchEvent(e: TouchEvent) {
    // TODO: Add scroll abort from
    // https://github.com/callemall/material-ui/blob/master/src/internal/TouchRipple.js

    if (e.type === 'touchstart') {
      this.ignoreNextMouseDown = true;
    }

    const xyArray: {[id: string]: number[]} = {};
    // tslint:disable-next-line
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      xyArray[touch.identifier] = [touch.clientX, touch.clientY];
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
    this.mouseDown = false;
    this.processInput('touchend', {});
  }

  public processInput(type: string, positions: {[id: string]: number[]}) {
    for (const k of Object.keys(positions)) {
      positions[k][0] = Math.floor((positions[k][0] - this.boundingRect.left) / this.ref.offsetWidth * 1000);
      positions[k][1] = Math.floor((positions[k][1] - this.boundingRect.top) / this.ref.offsetHeight * 1000);

      // For unknown reasons, clientX may sometimes appear to be -100vw from its correct position.
      // As a result we instead track the mod of the position.
      if (positions[k][0] < 0) {
        positions[k][0] += 1000;
      }

    }
    const e: InteractionEvent = {type: 'INTERACTION', positions, id: this.props.id || '', event: type};

    // Don't send move events over multiplayer.
    // Our implementation does not allow high-frequency value updates.
    if (type !== 'touchmove') {
      this.props.onEvent(e);
    }

    if (this.props.includeLocalInteractions && this.props.onInteraction) {
      this.props.onInteraction('local', e);
    }
  }

  public onRef(r: HTMLElement|null) {
    if (r === null || r === this.ref) {
      return;
    }
    this.ref = r;

    // Get the bounding rectangle and register listeners after render loop
    // ~15ms savings from bounding rect, plus 4ms per event listener per object on screen
    window.requestAnimationFrame(() => {
      if (this.ref !== r) {
        return; // Preempted
      }

      for (const k of Object.keys(this.listeners)) {
        // The `true` arg ensures touch events are propagated here during
        // the "capture" phase of event flow.
        // https://www.w3.org/TR/DOM-Level-3-Events/#event-flow
        this.ref.addEventListener(k, this.listeners[k], true);
      }
      this.boundingRect = this.ref.getBoundingClientRect();
    });
  }

  public componentWillUnmount() {
    this.props.onUnsubscribe(this.boundHandleMultiplayerEvent);

    if (!this.ref) {
      return;
    }
    for (const k of Object.keys(this.listeners)) {
      this.ref.removeEventListener(k, this.listeners[k], true);
    }
  }

  public render() {
    return (
      <div
        id={this.props.id}
        className={this.props.className + ' remote-affector'}
        style={{touchAction: 'pan-y'}}
        ref={(r: HTMLElement|null) => {this.onRef(r); }}>
        {this.props.children}
      </div>
    );
  }
}
