import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import NativeSelect from '@material-ui/core/NativeSelect';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import {CheckoutState, QuestState, SettingsType, UserState} from '../../../reducers/StateTypes';
import Button from '../../base/Button';
import Card from '../../base/Card';
import StarRating from '../../base/StarRating';

export interface StateProps {
  checkout: CheckoutState;
  platform: string;
  quest: QuestState;
  settings: SettingsType;
  user: UserState;
  showSharing: boolean;
}

export interface DispatchProps {
  onShare: (quest: QuestState) => void;
  onSubmit: (quest: QuestState, settings: SettingsType, user: UserState, anonymous: boolean, text: string, rating: number|null) => void;
  onTip: (checkoutError: string|null, amount: number, quest: QuestState, settings: SettingsType, anonymous: boolean, text: string, rating: number|null) => void;
}

export interface Props extends StateProps, DispatchProps {}

interface QuestEndState {
  anonymous: boolean;
  text: string;
  rating: number|null;
  favoritePart: string|undefined;
  primaryIssue: string|undefined;
  issueQualifier: string|undefined;
  needsIssue: boolean;
}

export default class QuestEnd extends React.Component<Props, {}> {
  public static readonly GOOD_RATING_THRESHOLD = 4;
  public static readonly BAD_RATING_THRESHOLD = 2;
  public state: QuestEndState;

  constructor(props: Props) {
    super(props);
    this.state = {
      anonymous: false,
      text: '',
      rating: null,
      favoritePart: undefined,
      primaryIssue: undefined,
      issueQualifier: undefined,
      needsIssue: false,
    };
  }

  private rating(): number {
    return (this.state.rating || 0);
  }

  private isGoodRating(): boolean {
    return this.rating() >= QuestEnd.GOOD_RATING_THRESHOLD;
  }

  private isBadRating(): boolean {
    const rating = this.rating();
    return Boolean(rating) && rating <= QuestEnd.BAD_RATING_THRESHOLD;
  }

  private onChange(field: keyof QuestEndState, value: string) {
    this.setState({[field]: value});
    if (field === 'primaryIssue' && value) {
      this.setState({needsIssue: false});
    }
  }

  private renderFeedbackForm(): JSX.Element {
    if (!this.rating()) {
      return <span className="nofeedbackform"/>;
    }

    let details: JSX.Element|null = null;
    if (this.isGoodRating()) {
      details = (<span>
        <p>Glad you liked it! What was your favorite part?</p>
        <FormControl className="selectfield" fullWidth={true}>
          <InputLabel htmlFor="favoritePart">Select</InputLabel>
          <NativeSelect
            inputProps={{
              id: 'favoritePart',
            }}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('favoritePart', e.target.value)}
            value={this.state.favoritePart}
          >
            <option value=""></option>
            <option value="Humor">Humor</option>
            <option value="Choices">Choices</option>
            <option value="Characters">Characters</option>
            <option value="Setting">Setting</option>
            <option value="Pacing">Pacing</option>
            <option value="Plot">Plot</option>
            <option value="Other">Other</option>
          </NativeSelect>
        </FormControl>
      </span>);
    } else {
      let qualifier: JSX.Element|null = null;
      if (this.state.primaryIssue && this.state.primaryIssue !== 'Other') {
        qualifier = (
          <FormControl className="selectfield" fullWidth={true}>
            <InputLabel htmlFor="issueQualifier">More Details</InputLabel>
            <NativeSelect
              inputProps={{
                id: 'issueQualifier',
              }}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('issueQualifier', e.target.value)}
              value={this.state.issueQualifier}>
            <option value=""></option>
            {this.state.primaryIssue === 'Duration' && [
              <option key={1} value="shorterThanLabeled">shorter than labeled</option>,
              <option key={2} value="longerThanLabeled">longer than labeled</option>,
              <option key={3} value="wantShorter">should be shorter</option>,
              <option key={4} value="wantLonger">should be longer</option>,
            ]}
            {this.state.primaryIssue === 'Quality' && [
              <option key={1} value="grammar">grammar</option>,
              <option key={2} value="tense">verb tense</option>,
              <option key={3} value="sp/typo">spelling/typos</option>,
              <option key={4} value="punctuation/format">punctuation/formatting</option>,
              <option key={5} value="run-on">run-on sentences</option>,
            ]}
            {this.state.primaryIssue === 'Story' && [
              <option key={1} value="characterDepth">lack of character depth</option>,
              <option key={2} value="plot">lack of plot depth</option>,
              <option key={3} value="choice">lack of choices</option>,
              <option key={4} value="combat">lack of combat</option>,
            ]}
            {this.state.primaryIssue === 'Difficulty' && [
              <option key={1} value="tooEasyForParty">too easy for our party size</option>,
              <option key={2} value="tooEasy">too easy overall</option>,
              <option key={3} value="tooHardForParty">too hard for our party size</option>,
              <option key={4} value="tooHard">too hard overall</option>,
            ]}
            <option value="other">something else</option>
            </NativeSelect>
          </FormControl>
        );
      }

      details = (<span>
        <p>{(this.isBadRating()) ? 'Please select the primary issue with the quest:' : 'What do you think could be improved?'}</p>
        <FormControl error={this.state.needsIssue} className="selectfield" fullWidth={true}>
          <InputLabel htmlFor="primaryIssue">Primary Issue</InputLabel>
          <NativeSelect
            id="primaryIssueSelect"
            inputProps={{
              id: 'primaryIssue',
            }}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('primaryIssue', e.target.value)}
            value={this.state.primaryIssue}>
            <option value=""></option>
            <option value="Duration">Duration</option>
            <option value="Quality">Quality</option>
            <option value="Story">Story</option>
            <option value="Difficulty">Difficulty</option>
            <option value="Other">Other</option>
          </NativeSelect>
        </FormControl>
        {this.state.needsIssue && <FormHelperText>You must specify an issue before submitting.</FormHelperText>}
        {qualifier}
      </span>);
    }

    return (
      <div>
        {details}
        <TextField
          className="textfield"
          fullWidth={true}
          label={<span>Anything else?</span>}
          multiline={true}
          margin="normal"
          onChange={(e: any) => this.setState({text: e.target.value})}
          onFocus={(e: any) => e.target.scrollIntoView()}
          value={this.state.text}
        />
        <FormControlLabel
          control={
              <Checkbox
                className="anonymous_feedback"
                checked={this.state.anonymous}
                onChange={() => { this.setState({anonymous: !this.state.anonymous}); }}/>
          }
          label="Give feedback anonymously"/>
      </div>
    );
  }

  private maybeRenderTipping(): JSX.Element|null {
    // Don't show tipping if the user had a bad time.
    if (!this.isGoodRating()) {
      return null;
    }
    // TODO ping server to determine if payments are enabled
    // TODO figure out why loading Stripe crashes iOS app
    let checkoutError: string|null = null;
    if (this.props.platform === 'ios') {
      checkoutError = 'Checkout currently disabled on iOS app';
    }
    if (!(window as any).Stripe) {
      checkoutError = 'Tipping temporarily unavailable.';
    }
    const tips = [1, 3, 5].map((tip: number) => {
      return (
        <Button key={tip} onClick={() => this.props.onTip(checkoutError, tip, this.props.quest, this.props.settings, this.state.anonymous, this.formatFeedback(), this.state.rating)}>
          ${tip}
        </Button>
      );
    });

    return (<span>
      <p>Tip the author (optional):</p>
      <div className={'tipAmounts ' + (checkoutError === null ? '' : 'checkoutDisabled')}>
          {tips}
      </div>
    </span>);
  }

  private formatFeedback(): string {
    if (this.isGoodRating()) {
      if (this.state.favoritePart || this.state.text) {
        return `Favorite Part: ${this.state.favoritePart || 'not given'}\nDetails: ${this.state.text || '--'}`;
      }
    } else {
      if (this.state.primaryIssue || this.state.issueQualifier) {
        return `Primary Issue: ${this.state.primaryIssue || 'not given'}\nQualifier: ${this.state.issueQualifier || 'not given'}\nDetails: ${this.state.text}`;
      }
    }
    return '';
  }

  private validateAndSubmit() {
    if (this.isBadRating() && !this.state.primaryIssue) {
      this.setState({needsIssue: true});
      return;
    } else {
      this.setState({needsIssue: false});
      this.props.onSubmit(this.props.quest, this.props.settings, this.props.user, this.state.anonymous, this.formatFeedback(), this.state.rating);
    }
  }

  public render() {
    const rated = this.state.rating !== null && (this.state.rating > 0);
    return (
      <Card title={this.props.quest.details.title}>
        <p>We hope you enjoyed <i>{this.props.quest.details.title}</i> by {this.props.quest.details.author}!</p>
        <p>Rate this quest:</p>
        <StarRating id="starrating" hintText={true} value={this.state.rating || 0} onChange={(rating: number) => { this.setState({rating}); }}></StarRating>
        {this.renderFeedbackForm()}
        {this.maybeRenderTipping()}
        <Button id="submit" onClick={() => this.validateAndSubmit()}>
          {rated ? 'Submit' : 'Return home'}
        </Button>
        {this.props.showSharing &&
          <Button id="shareButton" onClick={() => this.props.onShare(this.props.quest)}>
            <img className="inline_icon" src="images/share_small.svg"/> Share your adventure
          </Button>
        }
        <div className="inputSpacer"></div>
      </Card>
    );
  }
}
