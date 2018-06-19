import * as React from 'react'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import SelectField from '@material-ui/core/SelectField'
import TextField from '@material-ui/core/TextField'
import Checkbox from './base/Checkbox'
import {QuestType, DialogsState, DialogIDType, UserState} from '../reducers/StateTypes'
import {MIN_PLAYERS, MAX_PLAYERS} from '../Constants'
import {CONTENT_RATING_DESC, GENRES, LANGUAGES, THEMES} from '@expedition-qdl/schema/Constants'
import {ErrorType} from '../../errors/types'

declare var ga: any;

interface ErrorDialogProps extends React.Props<any> {
  open: boolean;
  errors: Error[];
  onRequestClose: ()=>void;
}

export class ErrorDialog extends React.Component<ErrorDialogProps, {}> {
  render() {
    const errors: JSX.Element[] = [];
    for (let i = 0; i < this.props.errors.length; i++) {
      const error = this.props.errors[i];
      // TODO: Include fold-out stack info
      errors.push(<li key={i}><strong>{error.name}</strong>: {error.message}</li>);
    }

    return (
      <Dialog
        title={(errors.length > 1) ? 'Errors Occurred' : 'Error Occurred'}
        actions={[<Button primary={true} onClick={() => this.props.onRequestClose()}
        >OK</Button>]}
        titleClassName={'dialogTitle dialogError'}
        modal={false}
        open={Boolean(this.props.open)}>
        <ul>
          {errors}
        </ul>
      </Dialog>
    );
  }
}

interface AnnotationDetailDialogProps extends React.Props<any> {
  open: boolean;
  annotations: (ErrorType|number)[];
  onRequestClose: ()=>void;
}

export class AnnotationDetailDialog extends React.Component<AnnotationDetailDialogProps, {}> {
  render() {
    if (!this.props.annotations) {
      return <span></span>;
    }

    const missingAnnotations: string = this.props.annotations.filter((v: number|ErrorType) => {
      return typeof(v) === 'number';
    }).join(', ');

    const renderedAnnotations: JSX.Element[] = this.props.annotations.filter((v: number | ErrorType) => {
      return typeof(v) !== 'number';
    }).map((a: ErrorType, i: number) => {
      const goodExampleJSX: JSX.Element[] = a.VALID.map((v: string, i: number) => {
        return <pre className="example" key={i}>{v}</pre>;
      });

      const badExampleJSX: JSX.Element[] = a.INVALID.map((v: string, i: number) => {
        return <pre className="example" key={i}>{v}</pre>;
      });

      return (
        <div className="annotation" key={i}>
          <h3>({a.NUMBER}): {a.NAME}</h3>
          <p>{a.DESCRIPTION}</p>
          {goodExampleJSX.length > 0 && <span>
            <strong>Good Examples</strong>
            <div>{goodExampleJSX}</div>
          </span>}
          {badExampleJSX.length > 0 && <span>
            <strong>Invalid Examples</strong>
            <div>{badExampleJSX}</div>
          </span>}
        </div>
       );
    });

    return (
      <Dialog
        title={'Message Details'}
        actions={[
          <Button primary={true} onClick={() => this.props.onRequestClose()}>OK</Button>,
        ]}
        titleClassName={'dialogTitle'}
        modal={false}
        autoScrollBodyContent={true}
        open={Boolean(this.props.open)}>
        <div className="annotation_details">
          {renderedAnnotations}
          {missingAnnotations && <div className="reminder">Couldn't find info for ID(s): {missingAnnotations}.</div>}
          <div className="reminder">
            Remember: You can ask for help at any time using the "Contact us" button at the bottom right
            of the page.
          </div>
        </div>
      </Dialog>
    );
  }
}

interface PublishingDialogProps extends React.Props<any> {
  handleMetadataChange: (quest: QuestType, key: string, value: any) => void;
  open: boolean;
  onRequestClose: () => void;
  onRequestPublish: (quest: QuestType, majorRelease: boolean, privatePublish: boolean) => void;
  quest: QuestType;
  user: UserState;
}

export class PublishingDialog extends React.Component<PublishingDialogProps, {}> {
  state: {
    majorRelease: boolean,
    privatePublish: boolean,
  };

  constructor(props: PublishingDialogProps) {
    super(props);
    this.state = {
      majorRelease: false,
      privatePublish: false,
    };
  }

  render(): JSX.Element {
    const metadata = this.props.quest.metadataRealtime;
    if (metadata === undefined) {
      return <span></span>;
    }
    const playerItems = [];
    for (let i = MIN_PLAYERS; i <= MAX_PLAYERS; i++) {
      playerItems.push(<MenuItem value={i} key={i}>{i}</MenuItem>);
    }
    const genres = GENRES.map((genre: string, index: number) => {
      return <MenuItem key={index} value={genre}>{genre}</MenuItem>;
    });
    const languages = LANGUAGES.map((language: string, index: number) => {
      return <MenuItem key={index} value={language}>{language}</MenuItem>;
    });
    const rating = CONTENT_RATING_DESC[metadata.get('contentrating')];
    const ratings = Object.keys(CONTENT_RATING_DESC).map((rating: string, index: number) => {
      return <MenuItem key={index} value={rating}>{rating}</MenuItem>;
    });
    const ratingDefinitions = rating && Object.keys(rating.details).map((category: string, index: number) => {
      return <li key={index}>{(rating.details as {[key: string]: string})[category]}</li>;
    });
    const themes = THEMES.map((theme: string, index: number) => {
      return <MenuItem key={index} value={theme}>{theme}</MenuItem>;
    })

    // TODO improve validation via errorText instead of alerts - https://github.com/ExpeditionRPG/expedition-quest-creator/issues/274
    return (
      <Dialog
        title="Publish your quest"
        titleClassName={'dialogTitle dialogGood'}
        className="publishForm"
        modal={false}
        open={Boolean(this.props.open)}
        autoScrollBodyContent={true}
        actions={[<Button onClick={() => this.props.onRequestClose()}>Back</Button>,
          <Button secondary={true}
          onClick={() => this.props.onRequestPublish(this.props.quest, this.state.majorRelease, this.state.privatePublish)}>
            Publish
          </Button>
        ]}
      >
        <TextField
          value={metadata.get('summary')}
          fullWidth={true}
          floatingLabelText="Quest summary (1-2 sentences)"
          onChange={(e: any, val: string) => { this.props.handleMetadataChange(this.props.quest, 'summary', val); }}
        />
        <TextField
          className="halfWidth"
          value={metadata.get('author')}
          floatingLabelText="Author name"
          onChange={(e: any, val: string) => { this.props.handleMetadataChange(this.props.quest, 'author', val); }}
        />
        <TextField
          className="halfWidth"
          value={metadata.get('email')}
          floatingLabelText="Author email (private)"
          onChange={(e: any, val: string) => { this.props.handleMetadataChange(this.props.quest, 'email', val); }}
        />
        <SelectField
          className="halfWidth"
          floatingLabelText="Minimum players"
          value={metadata.get('minplayers')}
          onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'minplayers', val); }}
        >
          {playerItems}
        </SelectField>
        <SelectField
          className="halfWidth"
          floatingLabelText="Maximum players"
          value={metadata.get('maxplayers')}
          onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'maxplayers', val); }}
        >
          {playerItems}
        </SelectField>
        <SelectField
          className="halfWidth"
          floatingLabelText="Minimum play time"
          value={metadata.get('mintimeminutes')}
          onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'mintimeminutes', val); }}
        >
          <MenuItem value={10}>10 minutes</MenuItem>
          <MenuItem value={20}>20 minutes</MenuItem>
          <MenuItem value={30}>30 minutes</MenuItem>
          <MenuItem value={40}>40 minutes</MenuItem>
          <MenuItem value={50}>50 minutes</MenuItem>
          <MenuItem value={60}>60 minutes</MenuItem>
          <MenuItem value={90}>90 minutes</MenuItem>
          <MenuItem value={120}>2 hours</MenuItem>
          <MenuItem value={180}>3 hours</MenuItem>
          <MenuItem value={999}>Over 3 hours</MenuItem>
        </SelectField>
        <SelectField
          className="halfWidth"
          floatingLabelText="Maximum play time"
          value={metadata.get('maxtimeminutes')}
          onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'maxtimeminutes', val); }}
        >
          <MenuItem value={10}>10 minutes</MenuItem>
          <MenuItem value={20}>20 minutes</MenuItem>
          <MenuItem value={30}>30 minutes</MenuItem>
          <MenuItem value={40}>40 minutes</MenuItem>
          <MenuItem value={50}>50 minutes</MenuItem>
          <MenuItem value={60}>60 minutes</MenuItem>
          <MenuItem value={90}>90 minutes</MenuItem>
          <MenuItem value={120}>2 hours</MenuItem>
          <MenuItem value={180}>3 hours</MenuItem>
          <MenuItem value={999}>Over 3 hours</MenuItem>
        </SelectField>
        <SelectField
          className="halfWidth"
          floatingLabelText="Language"
          value={metadata.get('language') || 'English'}
          onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'language', val); }}
        >
          {languages}
        </SelectField>
        <SelectField
          className="halfWidth"
          floatingLabelText="Genre"
          value={metadata.get('genre')}
          onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'genre', val); }}
        >
          {genres}
        </SelectField>
        <SelectField
          className="halfWidth"
          floatingLabelText="Visual Theme"
          value={metadata.get('theme')}
          onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'theme', val); }}
        >
          {themes}
        </SelectField>
        <div className="contentRatingInputContainer">
          <SelectField
            className="ratingSelect"
            floatingLabelText="Content rating"
            value={metadata.get('contentrating')}
            onChange={(e: any, i: number, val: number) => { this.props.handleMetadataChange(this.props.quest, 'contentrating', val); }}
          >
            {ratings}
          </SelectField>
          {metadata.get('contentrating') !== null && <ul className="ratingDefinition">{ratingDefinitions}</ul>}
        </div>
        <div>
          <Checkbox
            label="Requires &quot;The Horror&quot; Expansion"
            value={metadata.get('expansionhorror')}
            onChange={(checked: boolean) => { this.props.handleMetadataChange(this.props.quest, 'expansionhorror', checked); }}>
          </Checkbox>
        </div>
        <div>
          <Checkbox
            label="Requires Pen and Paper"
            value={metadata.get('requirespenpaper')}
            onChange={(checked: boolean) => { this.props.handleMetadataChange(this.props.quest, 'requirespenpaper', checked); }}>
          </Checkbox>
        </div>
        <div>
          <Checkbox
            label="Major release (resets ratings &amp; reviews)"
            value={this.state.majorRelease}
            onChange={(checked: boolean) => { this.setState({majorRelease: checked}); }}>
          </Checkbox>
        </div>
        <div className="halfWidth">
          <Checkbox
            label="Publish privately"
            value={this.state.privatePublish}
            onChange={(checked: boolean) => { this.setState({privatePublish: checked}); }}>
          </Checkbox>
          {this.state.privatePublish && <div>Your private quest will be visible only to you in the Expedition App (Tools > Private Quests).</div>}
        </div>
      </Dialog>
    );
  }
}

export interface DialogsStateProps {
  dialogs: DialogsState;
  quest: QuestType;
  user: UserState;
};

export interface DialogsDispatchProps {
  handleMetadataChange: (quest: QuestType, key: string, value: any) => void;
  onRequestClose: (dialog: DialogIDType) => void;
  onRequestPublish: (quest: QuestType, majorRelease: boolean, privatePublish: boolean) => void;
}

interface DialogsProps extends DialogsStateProps, DialogsDispatchProps {}

// TODO: Input args should be way shorter than this
const Dialogs = (props: DialogsProps): JSX.Element => {
  return (
    <span>
      <PublishingDialog
        handleMetadataChange={props.handleMetadataChange}
        open={props.dialogs.open['PUBLISHING']}
        onRequestClose={() => props.onRequestClose('PUBLISHING')}
        onRequestPublish={props.onRequestPublish}
        quest={props.quest}
        user={props.user}
      />
      <ErrorDialog
        open={props.dialogs.open['ERROR']}
        onRequestClose={() => props.onRequestClose('ERROR')}
        errors={props.dialogs.errors}
      />
      <AnnotationDetailDialog
        open={props.dialogs.open['ANNOTATION_DETAIL']}
        onRequestClose={() => props.onRequestClose('ANNOTATION_DETAIL')}
        annotations={props.dialogs.annotations}
      />
    </span>
  );
}

export default Dialogs;
