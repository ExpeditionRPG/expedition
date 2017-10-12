import * as React from 'react'
import {InteractionEvent} from 'expedition-qdl/lib/remote/Events'
import RemoteAffector from './remote/RemoteAffector'
import TouchIndicator from './TouchIndicator'

interface MultiTouchTriggerProps extends React.Props<any> {
  remoteID?: string;
  onTouchChange: (touches: any) => any;
}
interface MultiTouchTriggerState {
  clientInputs: {[client: string]: number[][]};
  lastTouchSum: number;
  mouseDown: Boolean;
}
export default class MultiTouchTrigger extends React.Component<MultiTouchTriggerProps, MultiTouchTriggerState> {

  constructor(props: MultiTouchTriggerProps) {
    super(props);
    this.state = {clientInputs: {}, lastTouchSum: 0, mouseDown: false};
  }

  remoteEvent(client: string, e: InteractionEvent) {
    switch (e.event) {
      case 'touchstart':
      case 'touchend':
      case 'touchmove':
        return this.processInput(e.positions, client);
      default:
        return;
    }
  }

  private processInput(xyArray: number[][], client: string) {
    let touchSum = 0;
    const newInputs = {...this.state.clientInputs};
    newInputs[client] = xyArray;
    for (const k of Object.keys(newInputs)) {
      touchSum += newInputs[k].length;
    }

    if (touchSum !== this.state.lastTouchSum) {
      this.props.onTouchChange(xyArray.length);
    }

    this.setState({lastTouchSum: touchSum, clientInputs: newInputs});
  }

  render() {
    return (
      <RemoteAffector
        remoteID={this.props.remoteID}
        className="base_multi_touch_remote_affector"
        includeLocalInteractions={true}
        onInteraction={(c: string, i: InteractionEvent) => {this.remoteEvent(c, i)}}>
        <TouchIndicator clientInputs={this.state.clientInputs} />
      </RemoteAffector>
    );
  }
}
