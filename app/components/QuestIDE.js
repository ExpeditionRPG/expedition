import {Tab} from 'material-ui/Tabs';
import ManualTabs from './base/ManualTabs';
import TextView from './base/TextView';
import {CodeViews} from './actions';

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

const QuestIDE = ({ dirty, text, error, tab, onTabChange, onDirty, onErrorClose }) => {
  return (
    <span style={{width: "100%", height: "100%"}}>
      <ManualTabs style={styles.tabsroot}
          onChangeAttempt={onTabChange}
          value={tab}>
        <Tab label="Markdown" value={CodeViews.MARKDOWN}/>
        <Tab label="XML View" value={CodeViews.XML}/>
      </ManualTabs>
      <div style={styles.tabcontainer}>
        <TextView
          mode="xml"
          value={text}
          onChange={(text) => onDirty(dirty, text)} />
      </div>
    </span>
  );
}

export default QuestIDE;
