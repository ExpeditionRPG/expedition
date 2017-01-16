import {connect} from 'react-redux'
import {AppState, XMLElement, SettingsType} from '../reducers/StateTypes'
import {toPrevious, toCard} from '../actions/card'
import {choice} from '../actions/quest'
import Roleplay, {RoleplayStateProps, RoleplayDispatchProps} from './Roleplay'
import {QuestContext} from '../reducers/QuestTypes'

const mapStateToProps = (state: AppState, ownProps: RoleplayStateProps): RoleplayStateProps => {
  return {
    ctx: state.quest && state.quest.result.ctx,
    node: state.quest && state.quest.node,
    roleplay: ownProps.roleplay, // Persist state to prevent sudden jumps during card change.
    settings: state.settings,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RoleplayDispatchProps => {
  return {
    onChoice: (settings: SettingsType, node: XMLElement, index: number, ctx: QuestContext) => {
      dispatch(choice(settings, node, index, ctx));
    },
  };
}

const RoleplayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Roleplay);

export default RoleplayContainer;
