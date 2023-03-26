import * as React from 'react';
import {AUTH_SETTINGS} from 'shared/schema/Constants';

declare var google: any;

export interface LoginButtonProps {
  onLogin: () => void;
}

export class LoginButton extends React.Component<LoginButtonProps, {}> {
  public btnRef: any;

  constructor(props: LoginButtonProps) {
    super(props);
    console.log('Client ID:', AUTH_SETTINGS.CLIENT_ID);
    google.accounts.id.initialize({
      client_id: AUTH_SETTINGS.CLIENT_ID,
      callback: this.handleCredentialResponse,
    });
    this.btnRef = React.createRef();
  }

  public handleCredentialResponse(response: any) {
    console.log('Encoded JWT ID token: ' + response.credential);
    // TODO redirect to new quest?
    this.props.onLogin();
  }

  public componentDidMount() {
    console.log('Login button mounted');
    console.log(this.btnRef.current);
    google.accounts.id.renderButton(
      this.btnRef.current, {
        theme: 'filled_black',
        text: 'signin_with',
      }
    );
  }

  public render(): JSX.Element {
    return (
      <div ref={this.btnRef}></div>
    );
  }
}

export default LoginButton;
