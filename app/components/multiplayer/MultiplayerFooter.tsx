import * as React from 'react'
import {black, white} from 'material-ui/styles/colors'
import FlatButton from 'material-ui/FlatButton'
import NetworkWifi from 'material-ui/svg-icons/device/network-wifi'
import SignalWifiOff from 'material-ui/svg-icons/device/signal-wifi-off'
import Close from 'material-ui/svg-icons/navigation/close'
import {CardThemeType, MultiplayerState} from '../../reducers/StateTypes'
import {getMultiplayerClient} from '../../Multiplayer'

export interface MultiplayerFooterStateProps {
  remotePlay: MultiplayerState;
}

export interface MultiplayerFooterDispatchProps {
  onMultiplayerExit: () => void;
  onMultiplayerStatusIconTap: () => void;
}

export interface MultiplayerFooterProps extends MultiplayerFooterStateProps, MultiplayerFooterDispatchProps {
  theme: CardThemeType;
}

const MultiplayerFooter = (props: MultiplayerFooterProps): JSX.Element => {
  const color = (props.theme === 'dark') ? white : black;
  const adventurerIcon = (props.theme === 'dark') ? 'images/adventurer_white_small.svg' : 'images/adventurer_small.svg';
  const peers: JSX.Element[] = [];
  const rpClient = getMultiplayerClient();
  const localKey = rpClient.getID() + '|' + rpClient.getInstance();
  for (const client of Object.keys(props.remotePlay.clientStatus)) {
    const lastStatus = props.remotePlay.clientStatus[client];
    if (!lastStatus.connected) {
      continue;
    }
    peers.push(<img key={client} className="inline_icon" src={adventurerIcon} />);
  }

  // TODO: Indicate when waiting for other user action
  const statusIcon = (<FlatButton onTouchTap={(e: any) => {props.onMultiplayerStatusIconTap();}} icon={
    (rpClient.isConnected()) ? <NetworkWifi color={color} /> : <SignalWifiOff color={color} />
  }/>);

  return (
    <div className={'remote_footer ' + props.theme}>
      <FlatButton icon={<Close color={color} />} onTouchTap={(e: any) => {props.onMultiplayerExit();}}/>
      <FlatButton className="peers">
        {peers}
      </FlatButton>
      {statusIcon}
    </div>
  );
}

export default MultiplayerFooter;
