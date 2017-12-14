import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import NetworkWifi from 'material-ui/svg-icons/device/network-wifi'
import SignalWifiOff from 'material-ui/svg-icons/device/signal-wifi-off'
import PauseCircle from 'material-ui/svg-icons/av/pause-circle-outline'
import Close from 'material-ui/svg-icons/navigation/close'
import Person from 'material-ui/svg-icons/social/person'
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
    if (client === localKey) {
      continue;
    }
    const lastStatus = props.remotePlay.clientStatus[client];
    if (!lastStatus.connected) {
      continue;
    }
    peers.push(<Person key={client}/>);
  }

  // TODO: Indicate when waiting for other user action
  const statusIcon = (<FlatButton icon={
    (rpClient.isConnected()) ? <NetworkWifi/> : <SignalWifiOff/>
  }/>);

  return (
    <div className="remote_footer">
      <FlatButton icon={<Close/>} onTouchTap={(e: any) => {props.onRemotePlayExit();}}/>
      {(peers.length > 0) ?
        <FlatButton className="peers">
          {peers}
        </FlatButton>
        : <div className="peers">No peers connected.</div>
      }
      {statusIcon}
    </div>
  );
}

export default RemoteFooter;
