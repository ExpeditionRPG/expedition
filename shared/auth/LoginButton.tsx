import * as React from 'react';
declare var google: any;

export interface LoginButtonProps {
  clientId: string;
  onLogin: (jwt: string) => void;
}

export class LoginButton extends React.Component<LoginButtonProps, {}> {
  public btnRef: any;

  constructor(props: LoginButtonProps) {
    super(props);
    google.accounts.id.initialize({
      client_id: props.clientId,
      callback: (response: any) => this.handleCredentialResponse(response),
    });
    this.btnRef = React.createRef();
  }

  public handleCredentialResponse(response: any) {
    this.props.onLogin(response.credential);
  }

  public componentDidMount() {
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
