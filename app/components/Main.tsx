import * as React from 'react';
import {Tab} from 'material-ui/Tabs';
import TextView from './base/TextView';
import {DirtyState} from '../reducers/StateTypes'
import DialogsContainer from './DialogsContainer';
import SplashContainer from './SplashContainer';
import QuestAppBarContainer from './QuestAppBarContainer';
import QuestDrawerContainer from './QuestDrawerContainer';
import QuestIDEContainer from './QuestIDEContainer';

const styles = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  tabsroot: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column'
  },
  tabcontainer: {
    overflowY: 'auto',
    height: "100%"
  }
};

export interface MainStateProps {
  loggedIn: boolean;
};

export interface MainDispatchProps {
}

interface MainProps extends MainStateProps, MainDispatchProps {}

const Main = (props: MainProps): JSX.Element => {
  if (props.loggedIn === null || props.loggedIn === undefined) {
    return (
      <div>Loading...</div>
    );
  } else if (props.loggedIn === true) {
    return (
      <div style={{width: "100%", height: "100%"}}>
        <QuestAppBarContainer/>
        <QuestIDEContainer/>
        <QuestDrawerContainer/>
        <DialogsContainer/>
      </div>
    );
  } else {
    return (
      <div style={{width: "100%", height: "100%"}}>
        <SplashContainer/>
      </div>
    );
  }
}

export default Main;
