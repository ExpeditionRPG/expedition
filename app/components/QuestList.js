import React from 'react';
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
import {NEW_QUEST, SAVE_QUEST, PUBLISH_QUEST, DELETE_QUEST, DOWNLOAD_QUEST} from './actions';

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

const styles = {
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

const QuestList = ({open, quests, onQuestSelect, onMenuSelect, onDrawerRequestChange, palette}) => {
  var body;
  if (quests === null) {
    body = <CircularProgress />;
  } else if (quests.length === 0) {
    body = <div>No saved quests.</div>
  } else {
    var menu = [];
    for (var i = 0; i < quests.length; i++) {
      var quest = quests[i];
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
      <SelectableList onChange={onQuestSelect.bind(this)}>
        <Subheader>{quests.length + " Saved Quests"}</Subheader>
        {menu}
      </SelectableList>;
  }

  // TODO add relatable icons
  return (
    <Drawer docked={false} onRequestChange={onDrawerRequestChange} open={open} width={styles.drawer.width}>
      <Toolbar style={{backgroundColor: palette.primary3Color}}>
        <ToolbarGroup>
          <ToolbarTitle style={{color: palette.alternateTextColor}} text="Options"/>
        </ToolbarGroup>
      </Toolbar>
      <Subheader>Edit</Subheader>
      <Menu onChange={onMenuSelect}>
        <MenuItem value={NEW_QUEST} primaryText="New" />
        <MenuItem value={SAVE_QUEST} primaryText="Save" />
        <MenuItem value={PUBLISH_QUEST} primaryText="Publish" />
        <MenuItem value={DOWNLOAD_QUEST} primaryText="Download" />
        <MenuItem value={DELETE_QUEST} primaryText="Delete" />
      </Menu>
      <Divider/>
      {body}
    </Drawer>
  )
}

export default QuestList;