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
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

// Translation components
import convertQuest from '../translation/convert';

// Custom components
import ManualTabs from './ManualTabs';
import QuestList from './QuestList';
import {UserDialog, ConfirmNewQuestDialog, ConfirmLoadQuestDialog} from './Dialogs';
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

var QUEST_SPEC_URL = "https://github.com/Fabricate-IO/expedition-quest-ide/blob/master/translation/quest_spec.md";

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
      user_dialog: false,
      tab: 'md',
      error: false
    };
  }

  onHTTPError(err) {
    console.log(err);
    this.setState({error: err.statusText + " (" + err.status + "): " + err.responseText});
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

  loadQuest(event, id) {
    // Ask for confirmation if dirty.
    if (this.dirty) {
      this.setState({load_quest_dialog: id});
      return;
    }

    console.log("Loading quest " + id);
    $.get("/quest/"+id, function(raw_result) {
      var result = JSON.parse(raw_result);
      $.get(result.url, function(xml) {
        this.quest = {
          url: result.url,
          xml: xml,
          md: convertQuest(xml, "xml", "md"),
          //graph: convertQuest(result.xml, "xml", "graph")
        }
        this.dirty = false;
        this.setState({id: result.id, last_save: result.modified, error: false, drawer_open: false});
      }.bind(this)).fail(this.onHTTPError.bind(this));
    }.bind(this)).fail(this.onHTTPError.bind(this));
  }

  newQuest() {
    if (this.dirty) {
      this.setState({new_quest_dialog: true});
      return;
    }

    this.quest = {
      xml: "",
      md: "",
    };
    this.dirty = false;
    this.setState({id: null, error: false, drawer_open: false});
  }

  deleteQuest() {
    $.post("/delete/" + this.state.id, function(result) {
      console.log(result);
      // TODO: Set actual quest state n'at
      this.dirty = false;
      this.setState({id: null, last_save: null, error: false, drawer_open: false});
      this.newQuest();
    }.bind(this)).fail(this.onHTTPError.bind(this));
  }

  saveQuest(cb) {
    if (!this.state.auth.profile) {
      if (cb) {
        cb(false);
      }
      // TODO: Error?
      return;
    }
    this.setState({saving: true});

    // Sync the quest state to ensure we're up to date.
    if (!this.syncQuestState(this.state.tab)) {
      return;
    }
    console.log(this.quest);

    if (this.quest.xml === undefined) {
      return this.onHTTPError({
        statusText: "ERR",
        status: "internal",
        responseText: "Could not sync quest state."
      });
    }
    $.post("/quest/" + this.state.id, this.quest.xml, function(result_quest_id) {
      this.setState({saving: false, last_save: Date.now(), id: result_quest_id});
      if (cb) {
        cb(true);
      }
    }.bind(this)).fail(function(err) {
      this.setState({saving: false});
      this.onHTTPError(err);
    }.bind(this));
  }

  downloadQuest() {
    if (!this.quest.url) {
      return this.onHTTPError({
        statusText: "ERR",
        status: "internal",
        responseText: "Quest has no saved data."
      });
    }
    window.open(this.quest.url, '_blank');
  }

  onChangeAttempt(prev, next, cb) {
    // Sync markdown and xml representations if we suspect either changed.
    if (!this.syncQuestState(prev)) {
      return;
    }
    this.setState({tab: next, error: false});
    return cb();
  }

  onLoadQuestDialogClose(choice) {
    if (choice === true) {
      this.saveQuest(function() {this.loadQuest(null, this.state.load_quest_dialog);}.bind(this));
    } else if (choice === false) {
      this.dirty = false;
      this.loadQuest(null, this.state.load_quest_dialog);
    }
    this.setState({load_quest_dialog: false});
  }

  onNewQuestDialogClose(choice) {
    if (choice === true) {
      this.saveQuest(this.newQuest.bind(this));
    } else if (choice === false) {
      this.dirty = false;
      this.newQuest();
    }
    this.setState({new_quest_dialog: false});
  }

  handleMenu(event, value) {
    // TODO: Add revisions ability
    switch(value) {
      case "new":
        return this.newQuest();
      case "save":
        return this.saveQuest();
      case "delete":
        return this.deleteQuest();
      case "download":
        return this.downloadQuest();
      case "help":
        window.open(QUEST_SPEC_URL, '_blank');
        return;
        break;
      default:
        throw new Error("Could not handle unknown menu value " + value);
    }
  }

  markDirty() {
    this.dirty = true;
    if (this.saver) {
      this.saver.markDirty();
    }
  }

  render(){
    var user_details;
    if (this.state.auth.profile) {
      user_details = (<Avatar src={this.state.auth.profile.image} onTouchTap={() => this.setState({user_dialog: true})}/>);
    } else {
      user_details = (<Avatar icon={<PersonOutlineIcon />} onTouchTap={() => this.setState({user_dialog: true})}/>);
    }

    // TODO: in help menu mention signed in by this.state.auth.profile.displayName
    // TODO: Actually use questsaver markDirty
    return (
      <div className="expedition-quest-ide" style={styles.container}>
        <UserDialog
          open={this.state.user_dialog}
          auth={this.state.auth}
          onRequestClose={() => this.setState({user_dialog: false})}
        />
        <ConfirmNewQuestDialog
          open={this.state.new_quest_dialog}
          onRequestClose={this.onNewQuestDialogClose.bind(this)}
        />
        <ConfirmLoadQuestDialog
          open={this.state.load_quest_dialog}
          onRequestClose={this.onLoadQuestDialogClose.bind(this)}
        />
        <AppBar
          title="Expedition Quest Editor"
          onLeftIconButtonTouchTap={() => this.setState({drawer_open: !this.state.drawer_open})}
          iconElementRight={user_details} />
        <QuestList
          onHTTPError={this.onHTTPError.bind(this)}
          onRequestChange={(open) => this.setState({drawer_open: open})}
          onQuestSelect={this.loadQuest.bind(this)}
          onMenuSelect={this.handleMenu.bind(this)}
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
              onChange={(data) => {this.quest.md = data; this.markDirty()}} />
          </Tab>
          <Tab label="XML View" value="xml">
            <TextView
              mode="xml"
              value={this.quest.xml}
              onChange={(data) => {this.quest.xml = data; this.markDirty()}} />
          </Tab>
        </ManualTabs>
        <QuestSaver
          id={this.state.id}
          signedIn={this.state.auth.profile}
          lastSave={this.state.last_save}
          ref={(s) => this.saver = s}
          onSaveRequest={this.saveQuest.bind(this)}/>
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


/*
TODO: Extra tabs
          <Tab label="Graph View" value="graph">
            <GraphView data={this.quest.graph} />
          </Tab>
          <Tab label="Adventurer View" value="adventurer">
            <AdventurerView/>
          </Tab>
*/

export default QuestIDE;