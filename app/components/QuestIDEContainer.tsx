import {connect} from 'react-redux'
import {setDirty} from '../actions/editor'
import {AppState} from '../reducers/StateTypes'
import {pushError} from '../error'
import QuestIDE, {QuestIDEStateProps, QuestIDEDispatchProps} from './QuestIDE'

var toMarkdown: any = require('../../translation/to_markdown')

const mapStateToProps = (state: AppState, ownProps: any): QuestIDEStateProps => {
  return {
    realtime: state.quest.mdRealtime,
    dirty: state.dirty
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestIDEDispatchProps => {
  return {
    onDirty: (realtime: any, dirty: boolean, text: string) => {
      realtime.setText(text);

      if (!dirty) {
        dispatch(setDirty(true));
      }
    }
  };
}

const QuestIDEContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestIDE);

export default QuestIDEContainer