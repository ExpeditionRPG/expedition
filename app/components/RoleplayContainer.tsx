import { connect } from 'react-redux'
import {AppState, XMLElement, SettingsType} from '../reducers/StateTypes'
import {toPrevious, toCard} from '../actions/card'
import {choice} from '../actions/quest'
import Roleplay, {RoleplayStateProps, RoleplayDispatchProps} from './Roleplay'
import {loadRoleplayNode} from '../QuestParser'

const mapStateToProps = (state: AppState, ownProps: RoleplayStateProps): RoleplayStateProps => {
  return {
    settings: state.settings,
    node: state.quest.node,
    roleplay: ownProps.roleplay, // Persist state to prevent sudden jumps during card change.
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RoleplayDispatchProps => {
  return {
    onChoice: (settings: SettingsType, node: XMLElement, index: number) => {
      dispatch(choice(settings, node, index));
    },
  };
}

const RoleplayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Roleplay);

export default RoleplayContainer