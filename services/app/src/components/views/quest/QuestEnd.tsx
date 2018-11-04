import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
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

  private renderFeedbackForm(): JSX.Element {
    if (!this.rating()) {
      return <span className="nofeedbackform"/>;
    }

    return (
      <div>
        <TextField
          className="textfield"
          fullWidth={true}
          label={<span>Feedback for the author?</span>}
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
