import * as React from 'react'
import TextField from 'material-ui/TextField'
import Button from './base/Button'
import Card from './base/Card'
import {QuestState, SettingsType, UserState, UserFeedbackState} from '../reducers/StateTypes'


export interface ReportStateProps {
  quest: QuestState;
  settings: SettingsType;
  user: UserState;
  userFeedback: UserFeedbackState;
}

export interface ReportDispatchProps {
  onChange: (key: string, value: string) => void;
  onSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
}

export interface ReportProps extends ReportStateProps, ReportDispatchProps {};

const Report = (props: ReportProps): JSX.Element => {
  return (
    <Card title="Report Quest">
      <p>You're reporting an issue with <i>{this.props.quest.details.title}</i>.</p>
      <p>You should report a quest if it is:</p>
      <ul>
        <li>Offensive or inappropriate, especially if it was marked as family-friendly.</li>
        <li>Broken or buggy</li>
        <li>Incomplete or missing sections</li>
      </ul>
      <p>Describe the issue:</p>
      <TextField
        className="textfield"
        fullWidth={true}
        hintText="Tell us how and where the quest issue occured"
        multiLine={true}
        onChange={(e: any) => this.props.onChange('text', e.target.value)}
        rows={3}
        rowsMax={6}
        underlineShow={false}
        value={this.props.userFeedback.text}
      />
      <Button onTouchTap={() => this.props.onSubmit(this.props.quest, this.props.settings, this.props.user, this.props.userFeedback)}>
        Submit
      </Button>
      <div className="inputSpacer"></div>
    </Card>
  );
};

export default Report;
