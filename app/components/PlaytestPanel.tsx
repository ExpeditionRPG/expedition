import * as React from 'react'
import {OverrideTextArea} from './base/OverrideTextArea'

export interface PlaytestPanelStateProps {}

export interface PlaytestPanelDispatchProps {}

interface PlaytestPanelProps extends PlaytestPanelStateProps, PlaytestPanelDispatchProps {}

const PlaytestPanel = (props: PlaytestPanelProps): JSX.Element => {
  return (
    <div className="console">
      <div className="interactive">
        TODO
      </div>
    </div>
  );
};

export default PlaytestPanel;
