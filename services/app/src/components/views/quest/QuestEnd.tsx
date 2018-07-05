import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import {logQuestPlay} from '../../../actions/Web';
import {CheckoutState, QuestState, SettingsType, UserState} from '../../../reducers/StateTypes';
import Button from '../../base/Button';
import Card from '../../base/Card';
import StarRating from '../../base/StarRating';

declare var window: any;

export interface QuestEndStateProps {
  checkout: CheckoutState;
  platform: string;
  quest: QuestState;
  settings: SettingsType;
  user: UserState;
}

export interface QuestEndDispatchProps {
  onShare: (quest: QuestState) => void;
  onSubmit: (quest: QuestState, settings: SettingsType, user: UserState, anonymous: boolean, text: string, rating: number|null) => void;
  onTip: (checkoutError: string|null, amount: number, quest: QuestState, settings: SettingsType, anonymous: boolean, text: string, rating: number|null) => void;
}

export interface QuestEndProps extends QuestEndStateProps, QuestEndDispatchProps {}

export default class QuestEnd extends React.Component<QuestEndProps, {}> {
  public state: {anonymous: boolean, text: string, rating: number|null};

  constructor(props: QuestEndProps) {
    super(props);
    this.state = {anonymous: false, text: '', rating: null};
  }

  public render() {
    const rated = this.state.rating !== null && (this.state.rating > 0);
    // TODO ping server to determine if payments are enabled
    // TODO figure out why loading Stripe crashes iOS app
    let checkoutError: string|null = null;
    if (this.props.platform === 'ios') {
      checkoutError = 'Checkout currently disabled on iOS app';
    }
    if (!window.Stripe) {
      checkoutError = 'Tipping temporarily unavailable.';
    }
    const tips = [1, 3, 5].map((tip: number) => {
      return (
        <Button key={tip} onClick={() => this.props.onTip(checkoutError, tip, this.props.quest, this.props.settings, this.state.anonymous, this.state.text, this.state.rating)}>
          ${tip}
        </Button>
      );
    });
    // TODO TextField underlineShow={false}
    return (
      <Card title={this.props.quest.details.title}>
        <p>We hope you enjoyed <i>{this.props.quest.details.title}</i> by {this.props.quest.details.author}!</p>
        <p>Rate this quest:</p>
        <StarRating hintText={true} value={this.state.rating || 0} onChange={(rating: number) => { this.setState({rating}); }}></StarRating>
        {rated &&
          <div>
            <TextField
              className="textfield"
              fullWidth={true}
              label={<span>Write a short review</span>}
              multiline={true}
              margin="normal"
              onChange={(e: any) => this.setState({text: e.target.value})}
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
        }
        Tip the author{this.state.rating && ' and submit your review:'}
        <div className={'tipAmounts ' + (checkoutError === null ? '' : 'checkoutDisabled')}>
          {tips}
        </div>
        <Button onClick={() => this.props.onSubmit(this.props.quest, this.props.settings, this.props.user, this.state.anonymous, this.state.text, this.state.rating)}>
          {rated ? 'Submit' : 'Return home'}
        </Button>
        {window.plugins && window.plugins.socialsharing &&
          <Button onClick={() => this.props.onShare(this.props.quest)}><img className="inline_icon" src="images/share_small.svg"/> Share your adventure</Button>
        }
        <div className="inputSpacer"></div>
      </Card>
    );
  }
}
