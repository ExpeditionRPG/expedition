import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import NetworkWifi from '@material-ui/icons/NetworkWifi';
import SignalWifiOff from '@material-ui/icons/SignalWifiOff';
import {playerOrder} from 'app/actions/Settings';
import * as React from 'react';
import {CardThemeType, DialogIDType, MultiplayerState} from '../../reducers/StateTypes';
import MultiplayerIcon from './MultiplayerIcon';

export interface StateProps {
  multiplayer: MultiplayerState;
  cardTheme: CardThemeType;
  questTheme: string;
  connected: boolean;
}

export interface DispatchProps {
  setDialog: (name: DialogIDType) => void;
}

export interface Props extends StateProps, DispatchProps {}

const MultiplayerFooter = (props: Props): JSX.Element => {
  const color = (props.cardTheme === 'dark') ? 'white' : 'black';
  const peers: JSX.Element[] = [];

  const order = playerOrder(props.multiplayer.session && props.multiplayer.session.secret || '');
  const clients = Object.keys(props.multiplayer.clientStatus).sort();
  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    const lastStatus = props.multiplayer.clientStatus[client];
    if (!lastStatus.connected) {
      continue;
    }

    const group: JSX.Element[] = [];
    for (let j = 0; j < (lastStatus.numLocalPlayers || 1); j++) {
      group.push(<MultiplayerIcon key={`${client}${j}`} className={`inline_icon player${order[i]}`} />);
    }
    peers.push(<span key={i} className="group">{group}</span>);
  }

  // TODO: Indicate when waiting for other user action
  // TODO Icon colors here and in IconButton below
  const statusIcon = (
    <IconButton onClick={(e: any) => {props.setDialog('MULTIPLAYER_STATUS'); }}>
      {(props.connected) ? <NetworkWifi className="yesWifi" nativeColor={color} /> : <SignalWifiOff className="noWifi" nativeColor={color} />}
    </IconButton>
  );

  return (
    <div className={`remote_footer card_theme_${props.cardTheme} quest_theme_${props.questTheme}`}>
      <IconButton onClick={(e: any) => {props.setDialog('EXIT_REMOTE_PLAY'); }}>
         <Close nativeColor={color} />
      </IconButton>
      <Button className="peers" onClick={() => {props.setDialog('MULTIPLAYER_PEERS'); }}>
        {peers}
      </Button>
      {statusIcon}
    </div>
  );
};

export default MultiplayerFooter;
