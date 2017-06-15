import * as React from 'react'
import {TouchTapEventHandler} from 'material-ui'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import LinkIcon from 'material-ui/svg-icons/content/link'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import TextField from 'material-ui/TextField'
import Toggle from 'material-ui/Toggle'

import Checkbox from './base/Checkbox'
import {ErrorType} from '../Error'
import {QuestType, ShareType, DialogsState, DialogIDType} from '../reducers/StateTypes'
import theme from '../Theme'
import {MIN_PLAYERS, MAX_PLAYERS} from '../Constants'
import {CONTENT_RATINGS, GENRES} from '../../node_modules/expedition-app/app/Constants'

declare var ga: any;

interface ErrorDialogProps extends React.Props<any> {
  open: boolean;
  errors: ErrorType[];
  onRequestClose: ()=>void;
}

export class ErrorDialog extends React.Component<ErrorDialogProps, {}> {
  render() {
    var errors: ErrorType[] = [];
    for (var i = 0; i < this.props.errors.length; i++) {
      var error = this.props.errors[i];
      ga('send', 'event', 'error', error.name, error.message);
      console.log(error.stack);
      errors.push(<div key={i}>{error.toString()}</div>);
    }

    return (
      <Dialog
        title="Errors Occurred"
        actions={[<RaisedButton
          label="OK"
          primary={true}
          onTouchTap={() => this.props.onRequestClose()}
        />]}
        titleClassName={'dialogTitle dialogError'}
        modal={false}
        open={Boolean(this.props.open)}>
        {errors}
      </Dialog>
    );
  }
}

interface PublishingDialogProps extends React.Props<any> {
  handleMetadataChange: (quest: QuestType, key: string, value: any) => void;
  open: boolean;
  onRequestClose: () => void;
  onRequestPublish: (quest: QuestType, majorRelease: boolean) => void;
  quest: QuestType;
}

export class PublishingDialog extends React.Component<PublishingDialogProps, {}> {
  state: { majorRelease: boolean };

  constructor(props: PublishingDialogProps) {
    super(props);
    this.state = { majorRelease: false };
  }

  render() {
    const metadata = this.props.quest.metadataRealtime;
    if (metadata === undefined) {
      return null;
    }
    const playerItems = [];
    for (let i = 1; i <= MAX_PLAYERS; i++) {
      playerItems.push(<MenuItem value={i} primaryText={i} key={i} />);
    }
    const genres = GENRES.map((genre: string, index: number) => {
      return <MenuItem key={index} value={genre} primaryText={genre} />;
    });
    const rating = (CONTENT_RATINGS as any)[metadata.get('contentrating')];
    const ratings = Object.keys(CONTENT_RATINGS).map((rating: string, index: number) => {
      return <MenuItem key={index} value={rating} primaryText={rating} />;
    });
    const ratingDefinitions = rating && Object.keys(rating).map((category: string, index: number) => {
      return <li key={index}>{rating[category]}</li>;
    });

    // TODO improve validation via errorText instead of alerts - https://github.com/ExpeditionRPG/expedition-quest-creator/issues/274
    return (
      <Dialog
        title="Publish your quest"
        titleClassName={'dialogTitle dialogGood'}
        className="publishForm"
        modal={false}
        open={Boolean(this.props.open)}
        autoScrollBodyContent={true}
        actions={[<FlatButton
          label="Back"
          onTouchTap={() => this.props.onRequestClose()}
        />,<RaisedButton
          label="Publish"
          secondary={true}
          onTouchTap={() => this.props.onRequestPublish(this.props.quest, this.state.majorRelease)}
        />]}
      >
        <TextField
          value={metadata.get('summary')}
          fullWidth={true}
          floatingLabelText="Quest summary (1-2 sentences)"
          onChange={(e: any, val: string) => { this.props.handleMetadataChange(this.props.quest, 'summary', val)}}
        />
        <TextField
          className="halfWidth"
          value={metadata.get('author')}
          floatingLabelText="Author name"
          onChange={(e: any, val: string) => { this.props.handleMetadataChange(this.props.quest, 'author', val)}}
        />
        <TextField
          className="halfWidth"
          value={metadata.get('email')}
          floatingLabelText="Contact email (private)"
          onChange={(e: any, val: string) => { this.props.handleMetadataChange(this.props.quest, 'email', val)}}
        />
        <SelectField
          className="halfWidth"
          floatingLabelText="Minimum players"
          value={metadata.get('minplayers')}
          onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'minplayers', val)}}
        >
          {playerItems}
        </SelectField>
        <SelectField
          className="halfWidth"
          floatingLabelText="Maximum players"
          value={metadata.get('maxplayers')}
          onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'maxplayers', val)}}
        >
          {playerItems}
        </SelectField>
        <SelectField
          className="halfWidth"
          floatingLabelText="Minimum play time"
          value={metadata.get('mintimeminutes')}
          onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'mintimeminutes', val)}}
        >
          <MenuItem value={10} primaryText="10 minutes" />
          <MenuItem value={20} primaryText="20 minutes" />
          <MenuItem value={30} primaryText="30 minutes" />
          <MenuItem value={40} primaryText="40 minutes" />
          <MenuItem value={50} primaryText="50 minutes" />
          <MenuItem value={60} primaryText="60 minutes" />
          <MenuItem value={90} primaryText="90 minutes" />
          <MenuItem value={120} primaryText="2 hours" />
          <MenuItem value={999} primaryText="Over 2 hours" />
        </SelectField>
        <SelectField
          className="halfWidth"
          floatingLabelText="Maximum play time"
          value={metadata.get('maxtimeminutes')}
          onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'maxtimeminutes', val)}}
        >
          <MenuItem value={10} primaryText="10 minutes" />
          <MenuItem value={20} primaryText="20 minutes" />
          <MenuItem value={30} primaryText="30 minutes" />
          <MenuItem value={40} primaryText="40 minutes" />
          <MenuItem value={50} primaryText="50 minutes" />
          <MenuItem value={60} primaryText="60 minutes" />
          <MenuItem value={90} primaryText="90 minutes" />
          <MenuItem value={120} primaryText="2 hours" />
          <MenuItem value={180} primaryText="3 hours" />
          <MenuItem value={999} primaryText="Over 3 hours" />
        </SelectField>
        <SelectField
          className="halfWidth"
          floatingLabelText="Genre"
          value={metadata.get('genre')}
          onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'genre', val)}}
        >
          {genres}
        </SelectField>
        <div className="contentRatingInputContainer">
          <SelectField
            className="ratingSelect"
            floatingLabelText="Content rating"
            value={metadata.get('contentrating')}
            onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'contentrating', val)}}
          >
            {ratings}
          </SelectField>
          {metadata.get('contentrating') !== null && <ul className="ratingDefinition">{ratingDefinitions}</ul>}
        </div>
        <Checkbox
          label="Major release (resets ratings & reviews)"
          value={this.state.majorRelease}
          onChange={(checked: boolean) => { this.setState({majorRelease: checked}); }}>
        </Checkbox>
      </Dialog>
    );
  }
}

export interface DialogsStateProps {
  open: DialogsState;
  quest: QuestType;
  errors: ErrorType[];
};

export interface DialogsDispatchProps {
  handleMetadataChange: (quest: QuestType, key: string, value: any) => void;
  onRequestClose: (dialog: DialogIDType) => void;
  onRequestPublish: (quest: QuestType, majorRelease: boolean) => void;
}

interface DialogsProps extends DialogsStateProps, DialogsDispatchProps {}

// TODO: Input args should be way shorter than this
const Dialogs = (props: DialogsProps): JSX.Element => {
  return (
    <span>
      <ErrorDialog
        open={props.open['ERROR']}
        onRequestClose={() => props.onRequestClose('ERROR')}
        errors={props.errors}
      />
      <PublishingDialog
        handleMetadataChange={props.handleMetadataChange}
        open={props.open['PUBLISHING']}
        onRequestClose={() => props.onRequestClose('PUBLISHING')}
        onRequestPublish={props.onRequestPublish}
        quest={props.quest}
      />
    </span>
  );
}

export default Dialogs;
