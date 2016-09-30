import { connect } from 'react-redux'
import {AppState, QuestAction} from '../reducers/StateTypes'
import {changeSetting} from '../actions/settings'
import {toPrevious, handleQuestChoice} from '../actions/card'
import {XMLElement, loadRoleplayNode} from '../scripts/QuestParser'
import Roleplay, {RoleplayStateProps, RoleplayDispatchProps} from './Roleplay'

const mapStateToProps = (state: AppState, ownProps: RoleplayStateProps): RoleplayStateProps => {
  return ownProps;
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RoleplayDispatchProps => {
  return {
    onChoice: (node: XMLElement, index: number) => {
      dispatch(handleQuestChoice(node, index));
    },
    onReturn: () => {
      dispatch(toPrevious());
    }
  };
}

const RoleplayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Roleplay);

export default RoleplayContainer