import {connect} from 'react-redux';
import Redux from 'redux';
import {search} from '../../actions/Search';
import {ensureLogin} from '../../actions/User';
import {initCustomCombat} from '../../components/views/quest/cardtemplates/combat/Actions';
import {AppState, SettingsType, UserState} from '../../reducers/StateTypes';
import Tools, {DispatchProps, StateProps} from './Tools';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    settings: state.settings,
    user: state.user,
  };
};

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onCustomCombatSelect(settings: SettingsType): void {
      dispatch(initCustomCombat({}));
    },
    onPrivateQuestsSelect(settings: SettingsType, user: UserState): void {
      dispatch(ensureLogin())
        .then((u: UserState) => {
          return dispatch(search({
            search: {
              order: '-published',
              owner: u.id,
              partition: 'expedition-private',
            },
            settings: {
              ...settings,
              contentSets: {
                horror: true,
              },
            },
          }));
        });
    },
  };
};

const ToolsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tools);

export default ToolsContainer;
