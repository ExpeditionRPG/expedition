import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import {UserState} from 'shared/auth/UserState';
import {CONTENT_RATING_DESC, ContentRating, enumValues, Genre, Language, Theme} from 'shared/schema/Constants';
import {ErrorType} from '../../errors/types';
import {MAX_PLAYERS, MIN_PLAYERS} from '../Constants';
import {DialogIDType, DialogsState, QuestType} from '../reducers/StateTypes';
import Checkbox from './base/Checkbox';

interface ErrorDialogProps extends React.Props<any> {
  open: boolean;
  errors: Error[];
  onClose: () => void;
}

export class ErrorDialog extends React.Component<ErrorDialogProps, {}> {
  public render() {
    const errors: JSX.Element[] = [];
    for (let i = 0; i < this.props.errors.length; i++) {
      const error = this.props.errors[i];
      // TODO: Include fold-out stack info
      errors.push(<li key={i}><strong>{error.name}</strong>: {error.message}</li>);
    }

    return (
      <Dialog
        open={Boolean(this.props.open)}
      >
        <DialogTitle className="dialogTitle dialogError">{(errors.length > 1) ? 'Errors Occurred' : 'Error Occurred'}</DialogTitle>
        <DialogContent>
          <ul>
            {errors}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => this.props.onClose()}>OK</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

interface AnnotationDetailDialogProps extends React.Props<any> {
  open: boolean;
  annotations: Array<ErrorType|number>;
  onClose: () => void;
}

export class AnnotationDetailDialog extends React.Component<AnnotationDetailDialogProps, {}> {
  public render() {
    if (!this.props.annotations) {
      return <span></span>;
    }

    const missingAnnotations: string = this.props.annotations.filter((v: number|ErrorType) => {
      return typeof(v) === 'number';
    }).join(', ');

    const renderedAnnotations: JSX.Element[] = this.props.annotations.filter((v: number | ErrorType) => {
      return typeof(v) !== 'number';
    }).map((a: ErrorType, i: number) => {
      const goodExampleJSX: JSX.Element[] = a.VALID.map((v: string, j: number) => {
        return <pre className="example" key={j}>{v}</pre>;
      });

      const badExampleJSX: JSX.Element[] = a.INVALID.map((v: string, j: number) => {
        return <pre className="example" key={j}>{v}</pre>;
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

    // TODO autoScrollBodyContent
    return (
      <Dialog
        className="messageDetailsDialog"
        open={Boolean(this.props.open)}>
        <DialogTitle className="dialogTitle">Message Details</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <div className="annotation_details">
              {renderedAnnotations}
              {missingAnnotations && <div className="reminder">Couldn't find info for ID(s): {missingAnnotations}.</div>}
              <div className="reminder">
                Remember: You can ask for help at any time using the "Contact us" button at the bottom right
                of the page.
              </div>
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => this.props.onClose()}>OK</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

interface PublishingDialogProps extends React.Props<any> {
  handleMetadataChange: (quest: QuestType, key: string, value: any) => void;
  open: boolean;
  onClose: () => void;
  onRequestPublish: (quest: QuestType, majorRelease: boolean, privatePublish: boolean) => void;
  quest: QuestType;
  user: UserState;
}

export class PublishingDialog extends React.Component<PublishingDialogProps, {}> {
  public state: {
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

  public render(): JSX.Element {
    const props = this.props;
    const {handleMetadataChange, quest} = props;
    const metadata = props.quest.metadataRealtime;
    if (metadata === undefined) {
      return <span></span>;
    }
    const playerItems = [];
    for (let i = MIN_PLAYERS; i <= MAX_PLAYERS; i++) {
      playerItems.push(<MenuItem value={i} key={i}>{i}</MenuItem>);
    }
    const genres = enumValues(Genre).map((genre: string, index: number) => {
      return <MenuItem key={index} value={genre}>{genre}</MenuItem>;
    });
    const languages = enumValues(Language).map((str: string, index: number) => {
      return <MenuItem key={index} value={str}>{str}</MenuItem>;
    });
    const rating = CONTENT_RATING_DESC[metadata.get('contentrating') as ContentRating];
    const ratings = Object.keys(CONTENT_RATING_DESC).map((str: string, index: number) => {
      return <MenuItem key={index} value={str}>{str}</MenuItem>;
    });
    const ratingDefinitions = rating && Object.keys(rating.details).map((category: string, index: number) => {
      return <li key={index}>{(rating.details as {[key: string]: string})[category]}</li>;
    });
    const themes = enumValues(Theme).map((theme: string, index: number) => {
      return <MenuItem key={index} value={theme}>{theme}</MenuItem>;
    });

    // TODO improve validation via errorText instead of alerts - https://github.com/ExpeditionRPG/expedition-quest-creator/issues/274
    // TODO autoScrollBodyContent
    return (
      <Dialog
        className="publishForm"
        fullWidth={true}
        maxWidth="md"
        open={Boolean(props.open)}
      >
        <DialogTitle className="dialogTitle dialogGood">Publish your quest</DialogTitle>
        <DialogContent className="publishFormControl">
          <TextField
            className="fullWidth"
            value={metadata.get('summary')}
            label="Quest summary (1-2 sentences)"
            // TODO get rid of these magic numbers
            onChange={(e: any) => { handleMetadataChange(quest, 'summary', e.target.value); }}
          />
          <TextField
            className="halfWidth"
            value={metadata.get('author')}
            label="Author name"
            onChange={(e: any) => { handleMetadataChange(quest, 'author', e.target.value); }}
          />
          <TextField
            className="halfWidth"
            value={metadata.get('email')}
            label="Author email (private)"
            onChange={(e: any) => { handleMetadataChange(quest, 'email', e.target.value); }}
          />
          <FormControl className="halfWidth">
            <InputLabel htmlFor="minplayers-select">Minimum players</InputLabel>
            <Select
              inputProps={{id: 'minplayers-select'}}
              value={metadata.get('minplayers') || MIN_PLAYERS}
              onChange={(e: any) => { handleMetadataChange(quest, 'minplayers', e.target.value); }}
            >
              {playerItems}
            </Select>
          </FormControl>
          <FormControl className="halfWidth">
            <InputLabel htmlFor="maxplayers-select">Maximum players</InputLabel>
            <Select
              inputProps={{id: 'maxplayers-select'}}
              value={metadata.get('maxplayers') || MAX_PLAYERS}
              onChange={(e: any) => { handleMetadataChange(quest, 'maxplayers', e.target.value); }}
            >
              {playerItems}
            </Select>
          </FormControl>
          <FormControl className="halfWidth">
            <InputLabel htmlFor="mintimeminutes-select">Minimum play time</InputLabel>
            <Select
              inputProps={{id: 'mintimeminutes-select'}}
              value={metadata.get('mintimeminutes') || 10}
              onChange={(e: any) => { handleMetadataChange(quest, 'mintimeminutes', e.target.value); }}
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
            </Select>
          </FormControl>
          <FormControl className="halfWidth">
            <InputLabel htmlFor="maxtimeminutes-select">Maximum play time</InputLabel>
            <Select
              inputProps={{id: 'maxtimeminutes-select'}}
              value={metadata.get('maxtimeminutes') || 999}
              onChange={(e: any) => { handleMetadataChange(quest, 'maxtimeminutes', e.target.value); }}
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
            </Select>
          </FormControl>
          <FormControl className="halfWidth">
            <InputLabel htmlFor="language-select">Language</InputLabel>
            <Select
              inputProps={{id: 'language-select'}}
              value={metadata.get('language') || 'English'}
              onChange={(e: any) => { handleMetadataChange(quest, 'language', e.target.value); }}
            >
              {languages}
            </Select>
          </FormControl>
          <FormControl className="halfWidth">
            <InputLabel htmlFor="genre-select">Genre</InputLabel>
            <Select
              inputProps={{id: 'genre-select'}}
              value={metadata.get('genre')}
              onChange={(e: any) => { handleMetadataChange(quest, 'genre', e.target.value); }}
            >
              {genres}
            </Select>
          </FormControl>
          <FormControl className="halfWidth">
            <InputLabel htmlFor="theme-select'">Visual Theme</InputLabel>
            <Select
              inputProps={{id: 'theme-select'}}
              value={metadata.get('theme')}
              onChange={(e: any) => { handleMetadataChange(quest, 'theme', e.target.value); }}
            >
              {themes}
            </Select>
          </FormControl>
          <FormControl className="contentRatingInputContainer fullWidth">
            <InputLabel htmlFor="contentrating-select">Content rating</InputLabel>
            <Select
              className="ratingSelect"
              inputProps={{id: 'contentrating-select'}}
              value={metadata.get('contentrating') || ''}
              onChange={(e: any) => { handleMetadataChange(quest, 'contentrating', e.target.value); }}
            >
              {ratings}
            </Select>
            {metadata.get('contentrating') !== null && <ul className="ratingDefinition">{ratingDefinitions}</ul>}
          </FormControl>
          <FormControl className="fullWidth">
            <Checkbox
              label="Requires &quot;The Horror&quot; Expansion"
              value={metadata.get('expansionhorror')}
              onChange={(checked: boolean) => { handleMetadataChange(quest, 'expansionhorror', checked); }}>
            </Checkbox>
          </FormControl>
          <FormControl className="fullWidth">
            <Checkbox
              label="Requires &quot;The Future&quot; Expansion"
              value={metadata.get('expansionfuture')}
              onChange={(checked: boolean) => { handleMetadataChange(quest, 'expansionfuture', checked); }}>
            </Checkbox>
          </FormControl>
          <FormControl className="fullWidth">
            <Checkbox
              label="Requires &quot;Scarred Lands&quot; Expansion"
              value={metadata.get('expansionscarredlands')}
              onChange={(checked: boolean) => { handleMetadataChange(quest, 'expansionscarredlands', checked); }}>
            </Checkbox>
          </FormControl>
          <FormControl className="fullWidth">
            <Checkbox
              label="Requires Pen and Paper"
              value={metadata.get('requirespenpaper')}
              onChange={(checked: boolean) => { handleMetadataChange(quest, 'requirespenpaper', checked); }}>
            </Checkbox>
          </FormControl>
          <FormControl className="fullWidth">
            <Checkbox
              label="Major release (resets ratings &amp; reviews)"
              value={this.state.majorRelease}
              onChange={(checked: boolean) => { this.setState({majorRelease: checked}); }}>
            </Checkbox>
          </FormControl>
          <FormControl className="fullWidth">
            <Checkbox
              label="Publish privately"
              value={this.state.privatePublish}
              onChange={(checked: boolean) => { this.setState({privatePublish: checked}); }}>
            </Checkbox>
            {this.state.privatePublish && <div>Your private quest will be visible only to you
              in the Expedition App (Tools > Private Quests).</div>}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.onClose()}>Back</Button>
          <Button color="secondary"
          onClick={() => props.onRequestPublish(quest, this.state.majorRelease, this.state.privatePublish)}>
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export interface DialogsStateProps {
  dialogs: DialogsState;
  quest: QuestType;
  user: UserState;
}

export interface DialogsDispatchProps {
  handleMetadataChange: (quest: QuestType, key: string, value: any) => void;
  onClose: (dialog: DialogIDType) => void;
  onRequestPublish: (quest: QuestType, majorRelease: boolean, privatePublish: boolean) => void;
}

interface DialogsProps extends DialogsStateProps, DialogsDispatchProps {}

// TODO: Input args should be way shorter than this
const Dialogs = (props: DialogsProps): JSX.Element => {
  return (
    <span>
      <PublishingDialog
        handleMetadataChange={props.handleMetadataChange}
        open={props.dialogs.open.PUBLISHING}
        onClose={() => props.onClose('PUBLISHING')}
        onRequestPublish={props.onRequestPublish}
        quest={props.quest}
        user={props.user}
      />
      <ErrorDialog
        open={props.dialogs.open.ERROR}
        onClose={() => props.onClose('ERROR')}
        errors={props.dialogs.errors}
      />
      <AnnotationDetailDialog
        open={props.dialogs.open.ANNOTATION_DETAIL}
        onClose={() => props.onClose('ANNOTATION_DETAIL')}
        annotations={props.dialogs.annotations}
      />
    </span>
  );
};

export default Dialogs;
