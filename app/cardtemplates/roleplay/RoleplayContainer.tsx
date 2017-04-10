import Redux from 'redux'
import {connect} from 'react-redux'
import {AppState, XMLElement, SettingsType} from '../../reducers/StateTypes'
import {toPrevious, toCard} from '../../actions/card'
import {choice} from '../../actions/quest'
import Roleplay, {RoleplayStateProps, RoleplayDispatchProps} from './Roleplay'
import {QuestContext} from '../../reducers/QuestTypes'
import {ParserNode} from '../../parser/Node'

const mapStateToProps = (state: AppState, ownProps: RoleplayStateProps): RoleplayStateProps => {
  return {
    node: ownProps.node, // Persist state to prevent sudden jumps during card change.
    settings: state.settings,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RoleplayDispatchProps => {
  return {
    onChoice: (settings: SettingsType, node: ParserNode, index: number) => {
      dispatch(choice(settings, node, index));
    },
  };
}

const RoleplayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Roleplay);

export default RoleplayContainer;
