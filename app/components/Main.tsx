import * as React from 'react'
import {Tab} from 'material-ui/Tabs'
import TextView from './base/TextView'
import DialogsContainer from './DialogsContainer'
import SplashContainer from './SplashContainer'
import QuestAppBarContainer from './QuestAppBarContainer'
import QuestIDEContainer from './QuestIDEContainer'
import ContextEditorContainer from './ContextEditorContainer'
import FlatButton from 'material-ui/FlatButton'

var SplitPane = require('react-split-pane') as any;

export interface MainStateProps {
  loggedIn: boolean;
  bottomPanelShown: boolean;
};

export interface MainDispatchProps {
  onDragFinished: (size: number) => void;
  onPanelToggle: () => void;
}

interface MainProps extends MainStateProps, MainDispatchProps {}

const Main = (props: MainProps): JSX.Element => {
  if (props.loggedIn === null || props.loggedIn === undefined) {
    return (
      <div className="main loading">
        Loading Expedition Quest Creator...
      </div>
    );
  } else if (props.loggedIn !== true) {
    return (
      <SplashContainer/>
    );
  }

  // TODO: Constant-ify default size of split pane
  if (!props.bottomPanelShown) {
    var contents = (
      <div className="contents">
        <QuestIDEContainer/>
        <div className="bottomPanel">
          <div className="header">
            <FlatButton label="Context Explorer" onTouchTap={(event: any) => {props.onPanelToggle();}} />
          </div>
        </div>
      </div>);
  } else {
    // SplitPane dimensions are measured as the size of the *editor* pane, not the
    // bottom pane.
    var contents = (<div className="contents"><SplitPane
      split="horizontal"
      defaultSize={window.innerHeight - 400}
      minSize={40}
      maxSize={window.innerHeight - 120}
      onDragFinished={(size: number) => {props.onDragFinished(size)}}>
        <QuestIDEContainer/>
        <div className="bottomPanel">
          <div className="header">
            <FlatButton label="Context Explorer" onTouchTap={(event: any) => {props.onPanelToggle();}} />
          </div>
          <ContextEditorContainer/>
        </div>
      </SplitPane></div>);
  }

  return (
    <div className="main">
      <QuestAppBarContainer/>
      <DialogsContainer/>
      {contents}
    </div>
  );
}

export default Main;
