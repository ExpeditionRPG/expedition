import * as React from 'react'
import TouchPanel, {TouchPanelProps} from './TouchPanel'
import {getRemotePlayClient} from '../../RemotePlay'
import {RemotePlayEvent} from 'expedition-qdl/lib/remote/Events'

export default class RemoteTouchPanel extends TouchPanel {
  ctx: any;
  canvas: any;
  inputArray: number[][];
  private boundHandleRemotePlayEvent: (e: RemotePlayEvent) => void;

  constructor(props: TouchPanelProps) {
    super(props);
    this.boundHandleRemotePlayEvent = this.handleRemotePlayEvent.bind(this);
    getRemotePlayClient().subscribe(this.boundHandleRemotePlayEvent);
    this.styles = {
      center: {
        radius: 24,
        color: 'rgba(128, 0, 0, 0.5)',
      },
      ring: {
        radius: 30,
        width: 5,
        color: 'rgba(0, 0, 0, 0.5)',
      },
    };
  }

  private handleRemotePlayEvent(e: RemotePlayEvent) {
    if (e.event.type !== 'TOUCH') {
      return;
    }

    // TODO: Use e.client for color table lookup, handle multiple clients
    this.processInput(e.event.positions);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    getRemotePlayClient().unsubscribe(this.boundHandleRemotePlayEvent);
  }
}
