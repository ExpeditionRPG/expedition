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
import Drawer from 'material-ui/Drawer';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconMenu from 'material-ui/IconMenu';
import PersonOutlineIcon from 'material-ui/svg-icons/social/person-outline';
import timeAgo from 'time-ago';

var timeFormatter = timeAgo();

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

// TODO: Actually use markDirty and move this to its own file.
class QuestSaver extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ago_interval: setInterval(this.updateAgo.bind(this), 10000),
      timeout: null,
      saving: false,
      last_save_ts: null,
      last_save_text: null,
    };

    // TODO: Preload last_save when prop is set.
  }

  markDirty() {
    if (!this.props.signedIn) {
      return;
    }
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
    setTimeout(this.state.timeout, this.save);
    this.setState({timeout: timeout});
  }

  save() {
    if (!this.props.signedIn) {
      return;
    }
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
    this.setState({timeout: null, saving: true});

    // Call into the parent to get saved data
    var savedata = this.props.onQuestStateRequest();
    console.log(savedata);
    $.post("/quest/" + savedata.type + "/" + this.props.id, savedata.data, function(result_quest_id) {
      this.props.onQuestIdChange(result_quest_id);
      this.setState({saving: false, last_save_ts: Date.now()});
      this.updateAgo();
    }.bind(this)).fail(function(err) {
      console.log(err);
      this.setState({saving: false, error: err.statusText + " (" + err.status + "): " + err.responseText});
    }.bind(this));

    // TODO: Check if dirtied while we were saving.
  }

  updateAgo() {
    if (this.state.last_save_ts) {
      this.setState({last_save_text: timeFormatter.ago(this.state.last_save_ts)});
    }
  }


  render() {
    var text;
    // Show saving text on timeout, not on actual save.
    if (!this.state.timeout) {
      if (this.state.last_save_text) {
        text = "Last saved " + this.state.last_save_text;
      } else {
        if (!this.props.signedIn) {
          text = "Log in to save.";
        } else {
          text = "Not yet saved."
        }
      }
    } else {
      text = "Saving...";
    }
    // TODO: Error tooltip.
    return (
      <span style={{cursor: 'pointer'}} onTouchTap={this.save.bind(this)}>{text}</span>
    )
  }
}

// TODO: Move this to its own file.
class QuestDrawer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      quests: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open) {
      // Do fetch of menu items
      $.get("/quests/0", function(result) {
        this.setState(JSON.parse(result));
      }.bind(this)).fail(function(err) {
        console.log(err);
        this.setState({error: err.statusText + " (" + err.status + "): " + err.responseText});
      }.bind(this));
    }
  }

  render() {
    var body;

    if (this.state.error) {
      body = <div>{this.state.error}</div>;
    } else if (this.state.quests.length === 0) {
      body = <div>No saved quests.</div>
    } else {
      body = [];
      for (var i = 0; i < this.state.quests.length; i++) {
        var id = this.state.quests[i].id;
        body.push(<MenuItem key={i} onTouchTap={() => this.props.onQuestSelect(id)} value={id}>
          <div>{this.state.quests[i].meta.title}</div>
          <div>{this.state.quests[i].meta.summary}</div>
        </MenuItem>);
      }
    }

    return (
      <Drawer docked={false} onRequestChange={this.props.onRequestChange} open={this.props.open}>
        <h1>{this.state.quests.length} Saved Quests</h1>
        <Menu>
          {body}
        </Menu>
      </Drawer>
    )
  }
}

export default class QuestIDE extends React.Component {

  constructor(props) {
    super(props);

    this.dirty = false;

    var auth = JSON.parse(document.getElementById("initial-state").textContent);

    this.state = {
      id: null,
      quest_md: "# Oust albanus\nauthor: scott\n\n_herp_\n\nderp\n\n**end**",
      quest_xml: "",
      quest_graph: "",
      quest_adventurer: "",
      auth: auth,
      drawer_open: false,
      tab: 'md',
      error: false
    };
  }

  markDirty() {
    this.dirty = true;
    console.log("dirty");
  }

  loadQuest(id) {
    $.get("/quest/"+id, function(json) {
      console.log(json);
      var result = JSON.parse(json);
      var st = {
        error: false,
        id: result.id,
        quest_md: result.markdown,
        quest_xml: result.xml
      };

      if (this.state.tab === 'md') {
        this.markdownView.setValue(result.markdown);
      } else if (this.state.tab === 'xml') {
        this.xmlView.setValue(result.xml);
      }

      this.setState(st);
      this.dirty = false;
    }.bind(this)).fail(function(err) {
      console.log(err);
      this.setState({error: err.statusText + " (" + err.status + "): " + err.responseText});
    }.bind(this));
  }

  getQuestState() {
    if (this.state.tab === 'md') {
      return {type: this.state.tab, data: this.markdownView.getValue()};
    } else if (this.state.tab === 'xml') {
      return {type: this.state.tab, data: this.xmlView.getValue()};
    }
  }

  onChangeAttempt(_, next, cb) {
    // TODO: Refactor to use getQuestState
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
      var st = {error: false, tab: next};
      st["quest_"+next] = result;
      this.setState(st);
      this.dirty = false;
      cb();
    }.bind(this)).fail(function(err) {
      console.log(err);
      this.setState({error: err.statusText + " (" + err.status + "): " + err.responseText});
    }.bind(this));
  }

  toggleDrawer() {
    this.setState({drawer_open: !this.state.drawer_open});
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
        }.bind(this)).fail(function(err) {
          console.log(err);
          // TODO: Share this in a member function.
          this.setState({error: err.statusText + " (" + err.status + "): " + err.responseText});
        }.bind(this));
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

    return (
      <div className="expedition-quest-ide" style={styles.container}>
        <AppBar
          title={<span><span>Expedition</span> <QuestSaver id={this.state.id} signedIn={this.state.auth.profile} onQuestStateRequest={this.getQuestState.bind(this)} onQuestIdChange={(id) => this.setState({'id': id})}/></span>}
          onLeftIconButtonTouchTap={this.toggleDrawer.bind(this)}
          iconElementRight={user_details}/>
        <QuestDrawer
          onRequestChange={(open) => this.setState({drawer_open: open})}
          onQuestSelect={this.loadQuest.bind(this)}
          open={this.state.drawer_open}>
        </QuestDrawer>
        <ManualTabs style={styles.tabsroot}
              tabTemplate={TabTemplate}
              onChangeAttempt={this.onChangeAttempt.bind(this)}
              contentContainerStyle={styles.tabcontainer}
              value={this.state.tab}>
          <Tab label="Markdown" value="md">
            <MarkdownView ref={(ref) => this.markdownView = ref} onChange={this.markDirty.bind(this)} />
          </Tab>
          <Tab label="XML View" value="xml">
            <XMLView ref={(ref) => this.xmlView = ref} onChange={this.markDirty.bind(this)} />
          </Tab>
          <Tab label="Graph View" value="graph">
            <GraphView />
          </Tab>
          <Tab label="Adventurer View" value="adventurer">
            <AdventurerView/>
          </Tab>
        </ManualTabs>
        <Snackbar
          open={this.state.error}
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