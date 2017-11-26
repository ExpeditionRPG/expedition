import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import NetworkWifi from 'material-ui/svg-icons/device/network-wifi'
import PauseCircle from 'material-ui/svg-icons/av/pause-circle-outline'
import Close from 'material-ui/svg-icons/navigation/close'
import Person from 'material-ui/svg-icons/social/person'
import {RemotePlayState} from '../../../reducers/StateTypes'

export interface RemoteFooterStateProps {
  remotePlay: RemotePlayState;
}

export interface RemoteFooterDispatchProps {
}

export interface RemoteFooterProps extends RemoteFooterStateProps, RemoteFooterDispatchProps {}

const RemoteFooter = (props: RemoteFooterProps): JSX.Element => {
  const peers = [0,1,2,3,4].map((v: number, i: number) => {
    return <Person key={i}/>;
  });

  // TODO: Indicate when disconnected and when waiting for other user action
  const statusIcon = <FlatButton icon={<NetworkWifi/>}/>;

  return (
    <div className="remote_footer">
      <FlatButton icon={<Close/>} onTouchTap={(e: any) => {console.log('TODO');}}/>
      <FlatButton className="peers">
        {peers}
      </FlatButton>
      {statusIcon}
    </div>
  );
}

export default RemoteFooter;
