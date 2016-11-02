import * as React from 'react'

import {Tab} from 'material-ui/Tabs'

import TextView from './base/TextView'
import {DirtyState, QuestType} from '../reducers/StateTypes'
import AppContainer from './AppContainer'

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
    height: "100%",
    display: "flex",
    flexDirection: "row",
  }
};


export interface QuestIDEStateProps {
  dirty: DirtyState;
  realtime: any;
  quest: QuestType;
};

export interface QuestIDEDispatchProps {
  onDirty: (realtime: any, dirty: DirtyState, quest: QuestType, text: string) => void;
}

interface QuestIDEProps extends QuestIDEStateProps, QuestIDEDispatchProps {}


const QuestIDE = (props: QuestIDEProps): JSX.Element => {
  // TODO: Add AppContainer
  return (
    <span style={{width: "100%", height: "100%"}}>
      <div style={styles.tabcontainer}>
        <TextView
          realtime={props.realtime}
          onChange={(text: string) => props.onDirty(props.realtime, props.dirty, props.quest, text)} />
      </div>
    </span>
  );
}

export default QuestIDE;
