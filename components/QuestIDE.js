import React from 'react';
import {Tab} from 'material-ui/Tabs';
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import FileFolder from 'material-ui/svg-icons/file/folder';
import Snackbar from 'material-ui/Snackbar';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconMenu from 'material-ui/IconMenu';
import PersonOutlineIcon from 'material-ui/svg-icons/social/person-outline';

// Translation components
import convertQuest from '../translation/convert';

// Custom components
import ManualTabs from './ManualTabs';
import QuestList from './QuestList';
import QuestSaver from './QuestSaver';
import TextView from './TextView';
import GraphView from './GraphView';
import AdventurerView from './AdventurerView';

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

    var test_filler = '<quest title="Oust albanus" author="scott">\n  <roleplay title="herp">\n    <p>derp</p>\n  </roleplay>\n  <trigger>end</trigger>\n</quest>';

    this.quest = {
      xml:  test_filler,
      md: convertQuest(test_filler, "xml", "md"),
      graph: convertQuest(test_filler, "xml", "graph")
    };

    this.state = {
      id: null,
      auth: auth,
      drawer_open: false,
      tab: 'md',
      error: false
    };
  }

  onHTTPError(err) {
    console.log(err);
    this.setState({error: err.statusText + " (" + err.status + "): " + err.responseText});
  }

  markDirty() {
    this.dirty = true;
    console.log("dirty");
  }

  syncQuestState(current) {
    try {
      if (this.dirty) {
        var alternate = (current === "md") ? "xml" : "md";
        this.quest[alternate] = convertQuest(this.quest[current], current, alternate);

        // Produce the graph data as well (xml is cheapest)
        this.quest.graph = convertQuest(this.quest.xml, "xml", "graph");
        this.dirty = false;
      }
      return true;
    } catch (err) {
      console.log(err);
      this.setState({error: err.toString()});
    }
  }

  loadQuest(id) {
    // TODO: Show "save existing quest" dialog before overwriting with new quest.
    console.log("Loading quest " + id);
    $.get("/quest/"+id, function(json) {
      console.log(json);
      var result = JSON.parse(json);
      this.quest = {
        xml: result.xml,
        md: convertQuest(result.xml, "xml", "md"),
        graph: convertQuest(result.xml, "xml", "graph")
      }
      this.dirty = false;
      this.setState({id: result.id, error: false, drawer_open: false});
    }.bind(this)).fail(this.onHTTPError.bind(this));
  }

  onChangeAttempt(prev, next, cb) {
    // Sync markdown and xml representations if we suspect either changed.
    if (!this.syncQuestState(prev)) {
      return;
    }
    this.setState({tab: next, error: false});
    return cb();
  }

  onQuestStateRequest() {
    if (!this.syncQuestState(this.state.tab)) {
      return;
    }
    console.log(this.quest);
    return this.quest.xml;
  }

  handleMenu(event, value) {
    switch(value) {
      case "sign_out":
        window.location = this.state.auth.logout;
        break;
      case "sign_in":
        window.location = this.state.auth.login;
        break;
      case "new":
        throw new Error("Unimplemented");
        break;
      case "revisions":
        throw new Error("Unimplemented");
        break;
      case "delete":
        $.post("/delete/" + this.state.id, function(result) {
          console.log(result);
          // TODO: Set actual quest state n'at
        }.bind(this)).fail(this.onHTTPError.bind(this));
        break;
      case "help":
        throw new Error("Unimplemented");
        break;
      default:
        throw new Error("Could not handle unknown menu value " + value);
    }
  }

  render(){
    var user_details;
    if (this.state.auth.profile) {
      user_details = (
        <span>
          <IconMenu
            iconButtonElement={<Avatar src={this.state.auth.profile.image} />}
            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
            onChange={this.handleMenu.bind(this)}>
            <MenuItem value="new" primaryText="New" />
            <MenuItem value="revisions" primaryText="Revisions" />
            <MenuItem value="delete" primaryText="Delete" />
            <MenuItem value="help" primaryText="Help" />
            <Divider />
            <MenuItem value="sign_out" primaryText={"Sign Out"} />
          </IconMenu>
        </span>
      );
    } else {
      user_details = (
        <IconMenu
          iconButtonElement = {<Avatar icon={<PersonOutlineIcon />} />}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          onChange={this.handleMenu.bind(this)}>
          <MenuItem value="sign_in" primaryText={"Sign in with Google"} />
        </IconMenu>
      );
    }

    // TODO: in help menu mention signed in by this.state.auth.profile.displayName
    // TODO: Actually use questsaver markDirty
    return (
      <div className="expedition-quest-ide" style={styles.container}>
        <AppBar
          title="Expedition"
          onLeftIconButtonTouchTap={() => this.setState({drawer_open: !this.state.drawer_open})}
          iconElementRight={
            <span>
              <QuestSaver
                id={this.state.id}
                onHTTPError={this.onHTTPError.bind(this)}
                signedIn={this.state.auth.profile}
                onQuestStateRequest={this.onQuestStateRequest.bind(this)}
                onQuestIdChange={(id) => this.setState({'id': id})}/>
              {user_details}
            </span>
          }/>
        <QuestList
          onHTTPError={this.onHTTPError.bind(this)}
          onRequestChange={(open) => this.setState({drawer_open: open})}
          onQuestSelect={this.loadQuest.bind(this)}
          open={this.state.drawer_open}>
        </QuestList>
        <ManualTabs style={styles.tabsroot}
              tabTemplate={TabTemplate}
              onChangeAttempt={this.onChangeAttempt.bind(this)}
              contentContainerStyle={styles.tabcontainer}
              value={this.state.tab}>
          <Tab label="Markdown" value="md">
            <TextView
              mode="markdown"
              value={this.quest.md}
              onChange={(data) => {this.quest.md = data; this.dirty=true;}} />
          </Tab>
          <Tab label="XML View" value="xml">
            <TextView
              mode="xml"
              value={this.quest.xml}
              onChange={(data) => {this.quest.xml = data; this.dirty=true;}} />
          </Tab>
          <Tab label="Graph View" value="graph">
            <GraphView data={this.quest.graph} />
          </Tab>
          <Tab label="Adventurer View" value="adventurer">
            <AdventurerView/>
          </Tab>
        </ManualTabs>
        <Snackbar
          open={Boolean(this.state.error)}
          style={{width: "50%"}}
          message={this.state.error}
          autoHideDuration={10000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

export default QuestIDE;