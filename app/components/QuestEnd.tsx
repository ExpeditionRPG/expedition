import * as React from 'react'

import {colors} from 'material-ui/styles'
import TextField from 'material-ui/TextField'

import Button from './base/Button'
import Card from './base/Card'
import Checkbox from './base/Checkbox'
import StarRating from './base/StarRating'

import {QuestState, SettingsType, UserState, UserFeedbackState} from '../reducers/StateTypes'

declare var window:any;


export interface QuestEndStateProps {
  quest: QuestState;
  settings: SettingsType;
  user: UserState;
  userFeedback: UserFeedbackState;
}

export interface QuestEndDispatchProps {
  onChange: (key: string, value: any) => void;
  onShare: (quest: QuestState) => void;
  onSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
}

export interface QuestEndProps extends QuestEndStateProps, QuestEndDispatchProps {};

export default class QuestEnd extends React.Component<QuestEndProps, {}> {
  render() {
    const loggedIn = (this.props.user && this.props.user.loggedIn);
    const rated = (this.props.userFeedback.rating > 0);

    return (
      <Card title={this.props.quest.details.title}>
        <p>We hope you enjoyed <i>{this.props.quest.details.title}</i> by {this.props.quest.details.author}!</p>
        <p>Rate this quest:</p>
        <StarRating hintText={true} value={this.props.userFeedback.rating} onChange={(rating: number) => { this.props.onChange('rating', rating); }}></StarRating>
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
          </div>
        }
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
