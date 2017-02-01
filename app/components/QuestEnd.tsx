import * as React from 'react'

import TextField from 'material-ui/TextField'

import Button from './base/Button'
import Card from './base/Card'

import {EndSettings, SettingsType, QuestState, XMLElement} from '../reducers/StateTypes'


export interface QuestEndStateProps {
  quest: QuestState;
  settings: SettingsType;
}

export interface QuestEndDispatchProps {
  onCommentChange: (text: string) => void;
  onSubmit: (quest: QuestState, settings: SettingsType) => void;
}

export interface QuestEndProps extends QuestEndStateProps, QuestEndDispatchProps {};

const QuestEnd = (props: QuestEndProps): JSX.Element => {
  return (
    <Card title="Feedback?">
      <p>We hope you enjoyed <i>{props.quest.details.title}</i> by {props.quest.details.author}!</p>
      <p>If you have any feedback you'd like to send to the author, now's your chance (providing feedback is option).</p>
      <FeedbackTextArea onBlur={props.onCommentChange}></FeedbackTextArea>
      <Button onTouchTap={() => props.onSubmit(props.quest, props.settings)}>
        {(props.quest.feedback === '' || props.quest.feedback == null) ? 'Return to menu' : 'Send feedback'}
      </Button>
    </Card>
  );
}

class FeedbackTextArea extends React.Component<any, any> {
  state: {value: string};

  constructor(props: QuestEndProps) {
    super(props)
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value: string) {
    this.setState({value: value});
    if (this.props.onChange) { this.props.onChange(value); }
  }

  render() {
    return (
      <TextField
        className={'textfield'}
        fullWidth={true}
        hintText="your feedback - what you liked, what you didn't like, bug reports, etc"
        // due to their funky implementation of hint text, can't move this to a stylesheet (no way to select)
        hintStyle={{color: '#444', top: '24px', left: '10px', right: '10px', bottom: 'auto'}}
        multiLine={true}
        onBlur={(e: any) => this.props.onBlur(e.target.value)}
        onChange={(e: any) => this.handleChange(e.target.value)}
        rows={3}
        value={this.state.value}
      />
    );
  }
}

export default QuestEnd;


