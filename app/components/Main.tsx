import * as React from 'react';
import {Tab} from 'material-ui/Tabs';
import TextView from './base/TextView';
import {DirtyState} from '../reducers/StateTypes'
import DialogsContainer from './DialogsContainer';
import SplashContainer from './SplashContainer';
import QuestAppBarContainer from './QuestAppBarContainer';
import QuestIDEContainer from './QuestIDEContainer';

export interface MainStateProps {
  loggedIn: boolean;
};

export interface MainDispatchProps {
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
    return (
      <div className="main">
        <QuestAppBarContainer/>
        <QuestIDEContainer/>
        <DialogsContainer/>
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
