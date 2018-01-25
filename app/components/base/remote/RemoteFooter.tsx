import * as React from 'react'
import {black, white} from 'material-ui/styles/colors'
import FlatButton from 'material-ui/FlatButton'
import NetworkWifi from 'material-ui/svg-icons/device/network-wifi'
import SignalWifiOff from 'material-ui/svg-icons/device/signal-wifi-off'
import Close from 'material-ui/svg-icons/navigation/close'
import {CardThemeType, RemotePlayState} from '../../../reducers/StateTypes'
import {getRemotePlayClient} from '../../../RemotePlay'

export interface RemoteFooterStateProps {
  remotePlay: RemotePlayState;
}

export interface RemoteFooterDispatchProps {
  onRemotePlayExit: () => void;
  onRemotePlayStatusIconTap: () => void;
}

export interface RemoteFooterProps extends RemoteFooterStateProps, RemoteFooterDispatchProps {
  theme: CardThemeType;
}

const RemoteFooter = (props: RemoteFooterProps): JSX.Element => {
  const color = (props.theme === 'DARK') ? white : black;
  const adventurerIcon = (props.theme === 'DARK') ? 'images/adventurer_white_small.svg' : 'images/adventurer_small.svg';
  const peers: JSX.Element[] = [];
  const rpClient = getRemotePlayClient();
  const localKey = rpClient.getID() + '|' + rpClient.getInstance();
  for (const client of Object.keys(props.remotePlay.clientStatus)) {
    const lastStatus = props.remotePlay.clientStatus[client];
    if (!lastStatus.connected) {
      continue;
    }
    peers.push(<img key={client} className="inline_icon" src={adventurerIcon} />);
  }

  // TODO: Indicate when waiting for other user action
  const statusIcon = (<FlatButton onTouchTap={(e: any) => {props.onRemotePlayStatusIconTap();}} icon={
    (rpClient.isConnected()) ? <NetworkWifi color={color} /> : <SignalWifiOff color={color} />
  }/>);

  return (
    <div className={'remote_footer ' + props.theme}>
      <FlatButton icon={<Close color={color} />} onTouchTap={(e: any) => {props.onRemotePlayExit();}}/>
      <FlatButton className="peers">
        {peers}
      </FlatButton>
      {statusIcon}
    </div>
  );
}

export default RemoteFooter;
