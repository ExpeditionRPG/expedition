import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import AlertError from '@material-ui/icons/Error';
import SyncIcon from '@material-ui/icons/Sync';
import * as React from 'react';
import {QuestActionType} from '../actions/ActionTypes';
import {AnnotationType, EditorState, QuestType, UserState} from '../reducers/StateTypes';

export interface StateProps {
  annotations: AnnotationType[];
  quest: QuestType;
  editor: EditorState;
  user: UserState;
  scope: any;
}

export interface DispatchProps {
  onMenuSelect: (action: QuestActionType, quest: QuestType) => void;
  onUserDialogRequest: (user: UserState) => void;
  onViewError: (annotations: AnnotationType[], editor: EditorState) => void;
  playFromCursor: (baseScope: any, editor: EditorState, quest: QuestType) => void;
}

interface Props extends StateProps, DispatchProps {}

class QuestAppBar extends React.Component<Props, {}> {
  public state: {menuAnchor: HTMLElement|undefined} = {menuAnchor: undefined};

  private handleMenuClick(e: any) {
    this.setState({menuAnchor: e.currentTarget});
  }

  private handleMenuClose() {
    this.setState({menuAnchor: undefined});
  }

  private renderSaveIndicator() {
    if (this.props.editor.dirtyTimeout !== null) {
      // saving - default (overrides other cases)
      return <span className="saveIndicator"><Button disabled={true}><SyncIcon /> Saving...</Button></span>;
    } else if (this.props.quest.saveError) {
      return (
        <span className="error saveIndicator">
          <Tooltip title={this.props.quest.saveError}><div>
            <Button disabled={true}><AlertError /> Error: unable to save</Button>
          </div></Tooltip>
        </span>
      );
    } else if (!this.props.editor.dirty) {
      return (
        <span className="success saveIndicator">
          <Button disabled={true}>All changes saved</Button>
        </span>
      );
    }
    return <span className="saveIndicator"><Button disabled={true}><SyncIcon /> Saving...</Button></span>;
  }

  private renderPublishButton() {
    let publishButton = (
      <Button
        disabled={this.props.quest.id === null}
        onClick={(event: any) => this.props.onMenuSelect('PUBLISH_QUEST', this.props.quest)}>
          {(this.props.quest.published) ? 'Update' : 'Publish'}
      </Button>
    );
    const errors = this.props.annotations.filter((annotation) => annotation.type === 'error');
    const validating = (this.props.editor.worker !== null);
    if (validating) {
      publishButton = <span className="validatingButton">
        <Button disabled={true}>
          <CircularProgress size={28} thickness={6} /> Validating...
        </Button>
      </span>;
    } else if (errors.length > 0) {
      const errorLabel = (errors.length > 1) ? 'View Errors' : 'View Error';
      publishButton = <span className="errorButton">
        <Button onClick={(event: any) => this.props.onViewError(this.props.annotations, this.props.editor)}>
          <AlertError /> {errorLabel}
        </Button>
      </span>;
    }
    return publishButton;
  }

  public render() {
    const { menuAnchor } = this.state;
    const loginText = 'Logged in as ' + this.props.user.displayName;
    const questTitle = this.props.quest.title || 'unsaved quest';
    return (
      <AppBar className="quest_app_bar">
        <Toolbar>
          <Typography variant="title" className="title">
            {questTitle}
          </Typography>
          <a href="https://expeditiongame.com/loot" target="_blank" className="lootPoints">
            {this.props.user.lootPoints} <img className="inline_icon" src="images/loot_white_small.svg" />
          </a>
          <span className="email">{this.props.user.email}</span>
          <IconButton onClick={(e: any) => this.handleMenuClick(e)}><ArrowDropDown /></IconButton>
          <Menu
            className="loginState"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => this.handleMenuClose()}
          >
            <MenuItem disabled={true}>{loginText}</MenuItem>
            <MenuItem onClick={() => this.props.onUserDialogRequest(this.props.user)}>Sign Out</MenuItem>
          </Menu>
        </Toolbar>
        <Toolbar className="toolbar">
          <Button onClick={(event: any) => this.props.onMenuSelect('NEW_QUEST', this.props.quest)}>
            New
          </Button>
          {this.renderPublishButton()}
          {Boolean(this.props.quest.published) &&
            <Button onClick={(event: any) => this.props.onMenuSelect('UNPUBLISH_QUEST', this.props.quest)}>
              Unpublish
            </Button>
          }
          <Tooltip title="View the source file in Google Drive"><span><Button disabled={this.props.quest.id === null} onClick={(event: any) => this.props.onMenuSelect('DRIVE_VIEW', this.props.quest)}>
            View in Drive
          </Button></span></Tooltip>
          {this.props.quest.published && <Tooltip title="Opens the published version of your quest in the web app"><span><Button id="appview" onClick={(event: any) => this.props.onMenuSelect('APP_VIEW', this.props.quest)}>
            View in App
          </Button></span></Tooltip>}
          <Button onClick={(event: any) => this.props.onMenuSelect('HELP', this.props.quest)}>
            Help
          </Button>
          {this.renderSaveIndicator()}
          <div className="rightButtons">
            <Button onClick={(event: any) => this.props.playFromCursor({}, this.props.editor, this.props.quest)}>
              Play from Cursor
            </Button>
            {this.props.editor.bottomPanel &&
              <Button onClick={(event: any) => this.props.playFromCursor(this.props.scope, this.props.editor, this.props.quest)}>
                Play from Cursor (preserve context)
              </Button>
            }
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default QuestAppBar;
