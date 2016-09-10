import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import TextView from './base/TextView';
import {CodeViewType} from '../actions/ActionTypes';

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

const QuestIDE = ({ dirty, text, error, tab, onTabChange, onDirty, onErrorClose }: any): JSX.Element => {
  console.log(tab.toLowerCase());
  return (
    <span style={{width: "100%", height: "100%"}}>
      <Tabs style={styles.tabsroot}
          onChange={onTabChange}
          value={tab}>
        <Tab label="Markdown" value={'MARKDOWN'}/>
        <Tab label="XML View" value={'XML'}/>
      </Tabs>
      <div style={styles.tabcontainer}>
        <TextView
          mode={tab.toLowerCase()}
          value={text}
          onChange={(text: string) => onDirty(dirty, text)} />
      </div>
    </span>
  );
}

export default QuestIDE;
