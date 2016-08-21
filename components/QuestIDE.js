import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import GraphView from './GraphView';
import XMLView from './XMLView';
import AdventurerView from './AdventurerView';
import MarkdownView from './MarkdownView';
import FileFolder from 'material-ui/svg-icons/file/folder';

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


// Override tab template to allow for full height display.
class TabTemplate extends React.Component {
  render() {
      if (!this.props.selected) {
          return null;
      }

      const styles = {
        background: "#121212",
        overflowY: 'auto',
        height: "100%"
      };

      return <div style={styles}>
        {this.props.children}
      </div>;
  }
}

export default class QuestIDE extends React.Component {

  onNodeMove(nid, pos) {

  }

  onNodeStartMove(nid) {

  }

  onNewConnector(n1,o,n2,i) {

  }

  render(){
    return (
      <div className="expedition-quest-ide" style={styles.container}>
        <AppBar title="Expedition" iconElementRight={
          <Avatar icon={<FileFolder />} />
        }/>
        <Tabs style={styles.tabsroot}
              tabTemplate={TabTemplate}
              contentContainerStyle={styles.tabcontainer} >
          <Tab label="Markdown" >
            <MarkdownView url="example/oust_albanus.md" />
          </Tab>
          <Tab label="XML View">
            <XMLView url="example/oust_albanus.xml" />
          </Tab>
          <Tab label="Graph View">
            <GraphView url="example/oust_albanus.json"/>
          </Tab>
          <Tab label="Adventurer View">
            <AdventurerView/>
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default QuestIDE;