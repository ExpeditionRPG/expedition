import {getMultiplayerClient} from 'app/Multiplayer';
import {SettingsType} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {
  handleCombatTimerHold,
  handleCombatTimerStop,
} from './Actions';
import NoTimer, {DispatchProps} from './NoTimer';
import {mapStateToProps} from './Types';

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onTimerStop: (node: ParserNode, settings: SettingsType, elapsedMillis: number, surge: boolean, seed: string) => {
      const multiplayerConnected = getMultiplayerClient().isConnected();

      // We don't want to **stop** the timer if we're connected to remote
      // play. Rather, we want to wait until everyone's timer is stopped
      // before moving on.
      // The server will tell us once everyone's ready.
      if (multiplayerConnected) {
        dispatch(handleCombatTimerHold({elapsedMillis}));
      } else {
        dispatch(handleCombatTimerStop({node, settings, elapsedMillis, seed}));
      }
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NoTimer);
