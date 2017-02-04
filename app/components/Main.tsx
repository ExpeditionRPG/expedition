import * as React from 'react';
import {Tab} from 'material-ui/Tabs';
import TextView from './base/TextView';
import DialogsContainer from './DialogsContainer';
import SplashContainer from './SplashContainer';
import QuestAppBarContainer from './QuestAppBarContainer';
import QuestIDEContainer from './QuestIDEContainer';
import ContextEditorContainer from './ContextEditorContainer';
import RemoveIcon from 'material-ui/svg-icons/content/remove'
import AddIcon from 'material-ui/svg-icons/content/add'

var SplitPane = require('react-split-pane') as any;

export interface MainStateProps {
  loggedIn: boolean;
  bottomPanelOpen: boolean;
};

export interface MainDispatchProps {
  onDragFinished: (size: number) => void;
}

interface MainProps extends MainStateProps, MainDispatchProps {}

const Main = (props: MainProps): JSX.Element => {
  if (props.loggedIn === null || props.loggedIn === undefined) {
    return (
      <div className="main loading">
        Loading Expedition Quest Creator...
      </div>
    );
  } else if (props.loggedIn === true) {
    // TODO: Constant-ify default size of split pane

    var contents = (
      <div className="contents">
        <QuestIDEContainer/>
        <div className="bottomPanel">
        <div className="header">
          <RemoveIcon onTouchTap={(event: any) => {console.log("herp");}}/>
          <h2>Context Explorer</h2>
        </div>
        <div className="bottomPanel"><div className="header"><h1>HERP</h1></div></div>
        </div>
      </div>);
    if (props.bottomPanelOpen) {
      var contents = (<div className="contents"><SplitPane
        split="horizontal"
        defaultSize={650}
        minSize={400}
        maxSize={50}
        onDragFinished={(size: number) => {props.onDragFinished(size)}}>
          <QuestIDEContainer/>
          <div className="bottomPanel">
            <div className="header">
              <RemoveIcon onTouchTap={(event: any) => {console.log("herp");}}/>
              <h2>Context Explorer</h2>
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
  } else {
    return (
      <div className="main">
        <SplashContainer/>
      </div>
    );
  }
}

export default Main;
