import {connect} from 'react-redux';
import {AppStateWithHistory} from '../../reducers/StateTypes';
import MultiplayerSync, {Props} from './MultiplayerSync';

const mapStateToProps = (state: AppStateWithHistory): Props => {
  return {
    multiplayer: state.multiplayer,
    commitID: state.commitID,
  };
};

const MultiplayerSyncContainer = connect(mapStateToProps)(MultiplayerSync);

export default MultiplayerSyncContainer;
