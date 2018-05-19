import * as React from 'react'

import {colors} from 'material-ui/styles'
import TextField from 'material-ui/TextField'
import Checkbox from 'material-ui/Checkbox'

import Button from '../../base/Button'
import Card from '../../base/Card'
import StarRating from '../../base/StarRating'

import {logQuestPlay} from '../../../actions/Web'
import {CheckoutState, QuestState, SettingsType, UserState, UserFeedbackState} from '../../../reducers/StateTypes'

declare var window:any;


export interface QuestEndStateProps {
  checkout: CheckoutState;
  platform: string;
  quest: QuestState;
  settings: SettingsType;
  user: UserState;
  userFeedback: UserFeedbackState;
}

export interface QuestEndDispatchProps {
  onChange: (key: string, value: any) => void;
  onShare: (quest: QuestState) => void;
  onSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
  onTip: (checkoutError: string|null, amount: number, quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
}

export interface QuestEndProps extends QuestEndStateProps, QuestEndDispatchProps {};

export default class QuestEnd extends React.Component<QuestEndProps, {}> {
  constructor(props: QuestEndProps) {
    super(props);
    logQuestPlay({phase: 'end'});
  }

  render() {
    const loggedIn = (this.props.user && this.props.user.loggedIn);
    const rated = this.props.userFeedback.rating !== undefined && (this.props.userFeedback.rating > 0);
    // TODO ping server to determine if payments are enabled
    // TODO figure out why loading Stripe crashes iOS app
    let checkoutError: string|null = null;
    if (this.props.platform === 'ios') {
      checkoutError = 'Checkout currently disabled on iOS app';
    }
    if (!window.Stripe) {
      checkoutError = 'Tipping temporarily unavailable.';
    }
    return (
      <Card title={this.props.quest.details.title}>
        <p>We hope you enjoyed <i>{this.props.quest.details.title}</i> by {this.props.quest.details.author}!</p>
        <p>Rate this quest:</p>
        <StarRating hintText={true} value={this.props.userFeedback.rating || 0} onChange={(rating: number) => { this.props.onChange('rating', rating); }}></StarRating>
        {rated &&
          <div>
            <p>Write a short review:</p>
            <TextField
              className="textfield"
              fullWidth={true}
              hintText="Tell us what you think"
              multiLine={true}
              onChange={(e: any) => this.props.onChange('text', e.target.value)}
              rows={3}
              rowsMax={6}
              underlineShow={false}
              value={this.props.userFeedback.text}
            />
            <Checkbox
              className="anonymous_feedback"
              checked={this.props.userFeedback.anonymous}
              onCheck={() => { this.props.onChange('anonymous', !this.props.userFeedback.anonymous); }}
              label="Give feedback anonymously"/>
          </div>
        }
        Tip the author{this.props.userFeedback.rating && ' and submit your review:'}
        <div className={'tipAmounts ' + (checkoutError === null ? '' : 'checkoutDisabled')}>
          <Button onTouchTap={() => this.props.onTip(checkoutError, 1, this.props.quest, this.props.settings, this.props.user, this.props.userFeedback)}>
            $1
          </Button>
          <Button onTouchTap={() => this.props.onTip(checkoutError, 3, this.props.quest, this.props.settings, this.props.user, this.props.userFeedback)}>
            $3
          </Button>
          <Button onTouchTap={() => this.props.onTip(checkoutError, 5, this.props.quest, this.props.settings, this.props.user, this.props.userFeedback)}>
            $5
          </Button>
        </div>
        <Button onTouchTap={() => this.props.onSubmit(this.props.quest, this.props.settings, this.props.user, this.props.userFeedback)}>
          {rated ? 'Submit' : 'Return home'}
        </Button>
        {window.plugins && window.plugins.socialsharing &&
          <Button onTouchTap={() => this.props.onShare(this.props.quest)}><img className="inline_icon" src="images/share_small.svg"/> Share your adventure</Button>
        }
        <div className="inputSpacer"></div>
      </Card>
    );
  }
}
