import React from 'react';
import {Tab} from 'material-ui/Tabs';
import ManualTabs from './ManualTabs';
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

  constructor(props) {
    super(props);

    this.state = {
      quest_md: "# Oust albanus\nauthor: scott\n\n_herp_\n\nderp\n\n**end**",
      quest_xml: "",
      quest_graph: ""
    };
  }

  onChangeAttempt(prev, next, cb) {
    if (prev === "graph" || prev === "adventurer") {
      return cb();
    }

    console.log(prev + " to " + next);
    var data;
    if (prev === "md") {
      data = this.markdownView.getValue();
    } else if (prev === "xml") {
      data = this.xmlView.getValue();
    }

    // Convert things
    $.post("/quest/123/"+prev+"/"+next, data, function(result) {
      var st = {};
      st["quest_"+next] = result;
      this.setState(st);
      cb();
    }.bind(this)).fail(function(err) {
      console.log(err);
    });
  }

  render(){
    return (
      <div className="expedition-quest-ide" style={styles.container}>
        <AppBar title="Expedition" iconElementRight={
          <Avatar icon={<FileFolder />} />
        }/>
        <ManualTabs style={styles.tabsroot}
              tabTemplate={TabTemplate}
              onChangeAttempt={this.onChangeAttempt.bind(this)}
              contentContainerStyle={styles.tabcontainer} >
          <Tab label="Markdown" value="md">
            <MarkdownView data={this.state.quest_md} ref={(ref) => this.markdownView = ref} />
          </Tab>
          <Tab label="XML View" value="xml">
            <XMLView data={this.state.quest_xml} ref={(ref) => this.xmlView = ref} />
          </Tab>
          <Tab label="Graph View" value="graph">
            <GraphView data={this.state.quest_graph} />
          </Tab>
          <Tab label="Adventurer View" value="adventurer">
            <AdventurerView/>
          </Tab>
        </ManualTabs>
      </div>
    );
  }
}

export default QuestIDE;