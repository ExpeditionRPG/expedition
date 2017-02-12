import * as React from 'react'

import TextField from 'material-ui/TextField'

import Button from './base/Button'
import Card from './base/Card'
import Checkbox from './base/Checkbox'

import {EndSettings, SettingsType, QuestState, QuestFeedbackState, UserState, XMLElement} from '../reducers/StateTypes'

declare var window:any;

export interface QuestEndStateProps {
  quest: QuestState;
  settings: SettingsType;
  user: UserState;
}

export interface QuestEndDispatchProps {
  onChange: (feedback: QuestFeedbackState) => void;
  onShare: (quest: QuestState) => void;
  onSubmit: (quest: QuestState, settings: SettingsType, user: UserState) => void;
}

export interface QuestEndProps extends QuestEndStateProps, QuestEndDispatchProps {};

const QuestEnd = (props: QuestEndProps): JSX.Element => {
  const feedbackExists = (props.quest.feedback != null && props.quest.feedback.text !== '')
  return (
    <Card title="Feedback?">
      <p>We hope you enjoyed <i>{props.quest.details.title}</i> by {props.quest.details.author}!</p>
      <p>If you have any feedback you'd like to send to the author, now's your chance (providing feedback is optional).</p>
      <FeedbackTextArea onChange={props.onChange}></FeedbackTextArea>
      {feedbackExists && <FeedbackCheckbox onChange={props.onChange} user={props.user}/>}
      <Button onTouchTap={() => props.onSubmit(props.quest, props.settings, props.user)}>
        {feedbackExists ? 'Send feedback' : 'Return to menu'}
      </Button>
      {window.plugins && window.plugins.socialsharing &&
        <Button onTouchTap={() => props.onShare(props.quest)}><img className="inline_icon" src="images/share_small.svg"/> Share your adventure</Button>
      }
      <div className="inputSpacer"></div>
    </Card>
  );
}

class FeedbackCheckbox extends React.Component<any, any> {
  state: {checked: boolean};

  constructor(props: QuestEndProps) {
    super(props);
    this.state = {checked: false};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(checked: boolean) {
    this.setState({checked: checked});
    this.props.onChange({shareUserEmail: checked}, this.props.user);
  }

  render() {
    return (
      <Checkbox
        label="Share your email"
        value={this.state.checked}
        onChange={(checked: boolean) => this.handleChange(checked)}
      >
        In case the quest author needs to contact you with additional questions.
      </Checkbox>
    );
  }
}

class FeedbackTextArea extends React.Component<any, any> {
  state: {value: string};

  constructor(props: QuestEndProps) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value: string) {
    this.setState({value: value});
    this.props.onChange({text: value});
  }

  render() {
    return (
      <TextField
        className={'textfield'}
        fullWidth={true}
        hintText="your feedback - what you liked, what you didn't like, bug reports, etc"
        multiLine={true}
        onChange={(e: any) => this.handleChange(e.target.value)}
        rows={3}
        rowsMax={6}
        underlineShow={false}
        value={this.state.value}
      />
    );
  }
}

export default QuestEnd;


