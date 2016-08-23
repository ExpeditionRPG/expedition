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
import Snackbar from 'material-ui/Snackbar';

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

    this.dirty = false;

    var auth = JSON.parse(document.getElementById("initial-state").textContent);

    this.state = {
      quest_md: "# Oust albanus\nauthor: scott\n\n_herp_\n\nderp\n\n**end**",
      quest_xml: "",
      quest_graph: "",
      quest_adventurer: "",
      auth: auth,
      error: false
    };
  }

  markDirty() {
    this.dirty = true;
    console.log("dirty");
  }

  onChangeAttempt(prev, next, cb) {
    var data;
    if (prev === "md") {
      this.state.quest_md = this.markdownView.getValue();
      data = this.state.quest_md;
    } else if (prev === "xml") {
      this.state.quest_xml = this.xmlView.getValue();
      data = this.state.quest_xml;
    } else if (prev === "graph" || prev === "adventurer") {
      if (next === 'xml' && !this.state.quest_xml.length && this.state.quest_md.length) {
        prev = "md";
        data = this.state.quest_md;
      } else if (next === 'md' && !this.state.quest_md.length && this.state.quest_xml.length) {
        prev = "xml";
        data = this.state.quest_xml;
      } else {
        return cb();
      }
    } else if (next === "graph" || next === "adventurer") {
      return cb();
    }

    if (!this.dirty && this.state["quest_"+next].length) {
      return cb();
    }

    // Convert things
    console.log("Fetching translation: " + prev + " -> " + next);
    $.post("/quest/123/"+prev+"/"+next, data, function(result) {
      var st = {error: false};
      st["quest_"+next] = result;
      this.setState(st);
      this.dirty = false;
      cb();
    }.bind(this)).fail(function(err) {
      console.log(err);
      this.setState({error: err.statusText + " (" + err.status + "): " + err.responseText});
    }.bind(this));
  }

  render(){
    var user_details;
    if (this.state.auth.profile) {
      user_details = (
        <span>
          <span>{this.state.auth.profile.displayName}</span>
          <Avatar src={this.state.auth.profile.image} />
          <a href={this.state.auth.logout}>Logout</a>
        </span>
      );
    } else {
      user_details = (
        <a href={this.state.auth.login}>Login with Google</a>
      );
    }

    return (
      <div className="expedition-quest-ide" style={styles.container}>
        <AppBar title="Expedition" iconElementRight={user_details}/>
        <ManualTabs style={styles.tabsroot}
              tabTemplate={TabTemplate}
              onChangeAttempt={this.onChangeAttempt.bind(this)}
              contentContainerStyle={styles.tabcontainer} >
          <Tab label="Markdown" value="md">
            <MarkdownView data={this.state.quest_md} ref={(ref) => this.markdownView = ref} onChange={this.markDirty.bind(this)} />
          </Tab>
          <Tab label="XML View" value="xml">
            <XMLView data={this.state.quest_xml} ref={(ref) => this.xmlView = ref} onChange={this.markDirty.bind(this)} />
          </Tab>
          <Tab label="Graph View" value="graph">
            <GraphView data={this.state.quest_graph} />
          </Tab>
          <Tab label="Adventurer View" value="adventurer">
            <AdventurerView/>
          </Tab>
        </ManualTabs>
        <Snackbar
          open={this.state.error}
          style="width: 50%"
          message={this.state.error}
          autoHideDuration={10000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

export default QuestIDE;