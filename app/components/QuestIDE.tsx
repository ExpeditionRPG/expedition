import * as React from 'react';
import {Tab} from 'material-ui/Tabs';
var ManualTabs: any = (require('./base/ManualTabs') as any).default;
import TextView from './base/TextView';
import {CodeViewType, DirtyType, EditorType} from '../reducers/StateTypes'

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

export interface QuestIDEStateProps {
  dirty: DirtyType;
  view: CodeViewType;
  text: string;
};

export interface QuestIDEDispatchProps {
  onTabChange: (currView: CodeViewType, nextView: CodeViewType, cb: any) => void;
  onDirty: (dirty: DirtyType, text: string) => void;
}

interface QuestIDEProps extends QuestIDEStateProps, QuestIDEDispatchProps {}

const QuestIDE = (props: QuestIDEProps): JSX.Element => {
  return (
    <span style={{width: "100%", height: "100%"}}>
      <ManualTabs style={styles.tabsroot}
          onChangeAttempt={props.onTabChange}
          value={props.view}>
        <Tab label="Markdown" value={'MARKDOWN'}/>
        <Tab label="XML View" value={'XML'}/>
      </ManualTabs>
      <div style={styles.tabcontainer}>
        <TextView
          mode={props.view.toLowerCase()}
          value={props.text}
          onChange={(text: string) => props.onDirty(props.dirty, text)} />
      </div>
    </span>
  );
}

export default QuestIDE;
