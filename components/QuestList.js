import React, {PropTypes} from 'react';
import Drawer from 'material-ui/Drawer';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import CircularProgress from 'material-ui/CircularProgress';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import ModeEditIcon from 'material-ui/svg-icons/editor/mode-edit';
import AddIcon from 'material-ui/svg-icons/content/add';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';

let SelectableList = MakeSelectable(List);

function wrapState(ComposedComponent) {
  return class SelectableList extends React.Component {
    handleRequestChange(event, index) {
      this.props.onChange(event, index);
    }

    render() {
      return (
        <ComposedComponent
          onChange={this.handleRequestChange.bind(this)}
        >
          {this.props.children}
        </ComposedComponent>
      );
    }
  };
}

SelectableList = wrapState(SelectableList);

class QuestList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      quests: null
    };

    this.styles = {
      menuItem: {
        minHeight: 200
      },
      menuItemSummary: {
        fontStyle : "italic"
      },
      drawer: {
        width: 300
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open && !this.props.open) {
      // TODO: Actually use tokens
      $.get("/quests/0", function(result) {
        this.setState(JSON.parse(result));
      }.bind(this)).fail(function(err) {
        this.setState({quests: []});
        this.props.onHTTPError(err);
      }.bind(this));
    }
  }

  render() {
    var body;
    if (this.state.quests === null) {
      body = <CircularProgress />;
    } else if (this.state.quests.length === 0) {
      body = <div>No saved quests.</div>
    } else {
      var menu = [];
      for (var i = 0; i < this.state.quests.length; i++) {
        var quest = this.state.quests[i];
        menu.push(
          <ListItem
            key={i}
            value={quest.id}
            rightIcon={<ModeEditIcon/>}
            primaryText={quest.meta.title}
            secondaryText={quest.meta.summary}
          />
        );
      }
      body =
        <SelectableList onChange={this.props.onQuestSelect.bind(this)}>
          <Subheader>{this.state.quests.length + " Saved Quests"}</Subheader>
          {menu}
        </SelectableList>;
    }

    // TODO add relatable icons
    return (
      <Drawer docked={false} onRequestChange={this.props.onRequestChange} open={this.props.open} width={this.styles.drawer.width}>
        <Toolbar style={{backgroundColor: this.context.muiTheme.palette.primary3Color}}>
          <ToolbarGroup>
            <ToolbarTitle style={{color: this.context.muiTheme.palette.alternateTextColor}} text="Options"/>
          </ToolbarGroup>
        </Toolbar>
        <Subheader>Edit</Subheader>
        <Menu onChange={this.props.onMenuSelect}>
          <MenuItem value="new" primaryText="New" />
          <MenuItem value="save" primaryText="Save" />
          <MenuItem value="publish" primaryText="Publish" />
          <MenuItem value="download" primaryText="Download" />
          <MenuItem value="delete" primaryText="Delete" />
          <MenuItem value="help" primaryText="Help" />
        </Menu>
        <Divider/>
        {body}
      </Drawer>
    )
  }
}

QuestList.contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

export default QuestList;