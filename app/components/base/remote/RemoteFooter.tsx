import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import NetworkWifi from 'material-ui/svg-icons/device/network-wifi'
import SignalWifiOff from 'material-ui/svg-icons/device/signal-wifi-off'
import Close from 'material-ui/svg-icons/navigation/close'
import {RemotePlayState} from '../../../reducers/StateTypes'
import {getRemotePlayClient} from '../../../RemotePlay'

export interface RemoteFooterStateProps {
  remotePlay: RemotePlayState;
}

export interface RemoteFooterDispatchProps {
  onRemotePlayExit: () => void;
}

export interface RemoteFooterProps extends RemoteFooterStateProps, RemoteFooterDispatchProps {}

const RemoteFooter = (props: RemoteFooterProps): JSX.Element => {
  const peers: JSX.Element[] = [];
  const rpClient = getRemotePlayClient();
  const localKey = rpClient.getID() + '|' + rpClient.getInstance();
  for (const client of Object.keys(props.remotePlay.clientStatus)) {
    const lastStatus = props.remotePlay.clientStatus[client];
    if (!lastStatus.connected) {
      continue;
    }
    peers.push(<img key={client} className="inline_icon" src="images/adventurer_small.svg" />);
  }

  // TODO: Indicate when waiting for other user action
  const statusIcon = (<FlatButton icon={
    (rpClient.isConnected()) ? <NetworkWifi/> : <SignalWifiOff/>
  }/>);

  return (
    <div className="remote_footer">
      <FlatButton icon={<Close/>} onTouchTap={(e: any) => {props.onRemotePlayExit();}}/>
      <FlatButton className="peers">
        {peers}
      </FlatButton>
      {statusIcon}
    </div>
  );
}

export default RemoteFooter;
