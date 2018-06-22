import * as React from 'react'
import {InteractionEvent} from '@expedition-qdl/multiplayer/Events'
import MultiplayerAffector from '../multiplayer/MultiplayerAffector'
import TouchIndicator from './TouchIndicator'

interface MultiTouchTriggerProps extends React.Props<any> {
  id?: string;
  onTouchChange: (touches: any) => any;
}
interface MultiTouchTriggerState {
  clientInputs: {[client: string]: {[id: string]: number[]}};
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

  private processInput(xyArray: {[id: string]: number[]}, client: string) {
    let touchSum = 0;
    const newInputs = {...this.state.clientInputs};
    newInputs[client] = xyArray;
    for (const k of Object.keys(newInputs)) {
      touchSum += Object.keys(newInputs[k]).length;
    }

    if (touchSum !== this.state.lastTouchSum) {
      this.props.onTouchChange(Object.keys(newInputs.local || {}).length);
    }

    this.setState({lastTouchSum: touchSum, clientInputs: newInputs});
  }

  render() {
    return (
      <MultiplayerAffector
        id={this.props.id}
        className="base_multi_touch_remote_affector"
        includeLocalInteractions={true}
        onInteraction={(c: string, i: InteractionEvent) => {this.remoteEvent(c, i)}}>
        <TouchIndicator clientInputs={this.state.clientInputs} />
      </MultiplayerAffector>
    );
  }
}
