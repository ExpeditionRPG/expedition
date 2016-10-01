import { connect } from 'react-redux'
import {AppState, XMLElement} from '../reducers/StateTypes'
import {toPrevious, toCard} from '../actions/card'
import {loadTriggerNode, handleChoice as handleChoiceInPlace} from '../QuestParser'
import {handleChoice} from '../actions/quest'
import Roleplay, {RoleplayStateProps, RoleplayDispatchProps} from './Roleplay'

const mapStateToProps = (state: AppState, ownProps: RoleplayStateProps): RoleplayStateProps => {
  return ownProps;
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RoleplayDispatchProps => {
  return {
    onChoice: (node: XMLElement, index: number) => {
      if (loadTriggerNode(handleChoiceInPlace(node, index)).name === 'end') {
        dispatch(toPrevious('QUEST_START'));
      } else {
        dispatch(handleChoice(index));
        dispatch(toCard('QUEST_CARD'));
      }
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