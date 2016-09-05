import { combineReducers } from 'redux'
import { SET_CODE_VIEW, SET_DIRTY, SET_DIALOG, CodeViews, QuestActions, DialogIDs, TOGGLE_DRAWER } from './actions'
import toXML from '../../translation/to_xml'

const xml_filler = '<quest title="Quest Title" author="Your Name" email="email@example.com" summary="Quest summary" url="yoursite.com" recommended-min-players="2" recommended-max-players="4" min-time-minutes="20" max-time-minutes="40">\n  <roleplay title="Roleplay Title">\n    <p>roleplay text</p>\n  </roleplay>\n  <trigger>end</trigger>\n</quest>';

function code(state = {xml: xml_filler, view: CodeViews.XML, error: null}, action) {
  switch (action.type) {
    case SET_CODE_VIEW:
      try {
        console.log("Code reducer view " + action.currview);
        if (action.currview === CodeViews.MARKDOWN) {
          var converted = toXML(action.currcode);
          action.cb();
          return {xml: converted, view: action.nextview, error: null};
        } else {
          return {xml: action.currcode, view: action.nextview, error: null};
        }
      } catch (e) {
        return {xml: (action.currview === CodeViews.XML) ? action.currcode : state.xml, view: state.view, error: e};
      };
    default:
      return state;
  }
}

function dirty(state = false, action) {
  switch (action.type) {
    case SET_DIRTY:
      return action.is_dirty;
    default:
      return state;
  }
}

function drawer(state = {open: false, isFetching: false, quests: null, error: null}, action) {
  switch (action.type) {
    case TOGGLE_DRAWER:
      return {open: !state.open, isFetching: true, quests: null}; // TODO: Fetch
    default:
      return state;
  }
}

/*
if (nextProps.open && !this.props.open) {
  // TODO: Actually use tokens
  $.get("/quests/0", function(result) {
    this.setState(JSON.parse(result));
  }.bind(this)).fail(function(err) {
    this.setState({quests: []});
    this.props.onHTTPError(err);
  }.bind(this));
}

  constructor(props) {
    super(props);

    this.dirty = false;



    this.test_filler = '<quest title="Quest Title" author="Your Name" email="email@example.com" summary="Quest summary" url="yoursite.com" recommended-min-players="2" recommended-max-players="4" min-time-minutes="20" max-time-minutes="40">\n  <roleplay title="Roleplay Title">\n    <p>roleplay text</p>\n  </roleplay>\n  <trigger>end</trigger>\n</quest>';

    this.state = {
      id: null,
      auth: auth,
      drawer_open: false,
      user_dialog: false,
      tab: 'md',
      error: false
    };

    this.newQuest();
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
      xml:  this.test_filler,
      md: convertQuest(this.test_filler, "xml", "md"),
      graph: convertQuest(this.test_filler, "xml", "graph")
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

  publishQuest() {
    if (!this.state.id) {
      return this.onHTTPError({
        statusText: "ERR",
        status: "internal",
        responseText: "Quest has no saved data."
      });
    }

    $.post("/published/" + this.state.id + "/true", function(short_url) {
      this.setState({publish_quest_dialog: true, shortUrl: short_url});
    }.bind(this)).fail(this.onHTTPError.bind(this));
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

  onPublishQuestDialogClose(choice) {
    this.setState({publish_quest_dialog: false});
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
      case "publish":
        return this.publishQuest();
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



        <QuestIDEContainer/>
      </div>
    );
  } */

function quest(state = {id: null, isFetching: false, meta: null, error: null}, action) {
  switch(action.type) {
    // TODO: Implement
    case QuestActions.LOAD:
      return state;
    case QuestActions.DELETE:
      return state;
    case QuestActions.SAVE:
      return state;
    case QuestActions.PUBLISH:
      return state;
    case QuestActions.DOWNLOAD:
      return state;
    default:
      return state;
  }
}

function dialogs(state = {
  [DialogIDs.USER]: false,
  [DialogIDs.CONFIRM_NEW_QUEST]: false,
  [DialogIDs.CONFIRM_LOAD_QUEST]: false,
  [DialogIDs.PUBLISH_QUEST]: false},
  action) {

  switch (action.type) {
    case SET_DIALOG:
      return {...state, [DialogIDs.USER]: action.shown};
    default:
      return state;
  }
}

const questIDEApp = combineReducers({
  code,
  dirty,
  drawer,
  dialogs,
  quest
})

export default questIDEApp