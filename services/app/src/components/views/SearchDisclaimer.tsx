import * as React from 'react';
import LoginButton from 'shared/auth/LoginButton';
// import Button from '../base/Button';
import Card from '../base/Card';
import Checkbox from '../base/Checkbox';

export interface Props {
  onLogin: (jwt: string, subscribe: boolean) => void;
}

class SearchDisclaimer extends React.Component<Props, {}> {
  public state: {
    subscribe: boolean;
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      subscribe: false,
    };
  }

  public onSubscribeChange(value: boolean) {
    this.setState({subscribe: value});
  }

  public render() {
    return (
      <Card title="Disclaimer">
        <p>
          Community quests are written by adventurers like yourselves using the free quest creator (Quests.ExpeditionGame.com).
          We offer no guarantees for the quests you are about to play, but do our best to review them for quality, and provide players with
          the ability to rate, review and report quests.
        </p>
        <p>
          We use your Google email as your identity when rating and reviewing quests.
        </p>
        <p>
          You must log in to continue:
        </p>
        <Checkbox label="Join the Mailing List" value={this.state.subscribe} onChange={(v: boolean) => { this.onSubscribeChange(v); }}>
          Learn about the latest quests, features and more - once per month!
        </Checkbox>
        <LoginButton onLogin={(jwt: string) => this.props.onLogin(jwt, this.state.subscribe)}/>
      </Card>
    );
  }
}

export default SearchDisclaimer;
