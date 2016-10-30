import {connect} from 'react-redux'
import {setDirty} from '../actions/editor'
import {saveQuest} from '../actions/quest'
import {AppState, QuestType} from '../reducers/StateTypes'
import {pushError} from '../error'
import QuestIDE, {QuestIDEStateProps, QuestIDEDispatchProps} from './QuestIDE'

var toMarkdown: any = require('../../translation/to_markdown')

const mapStateToProps = (state: AppState, ownProps: any): QuestIDEStateProps => {
  return {
    dirty: state.dirty,
    realtime: state.quest.mdRealtime,
    quest: state.quest,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestIDEDispatchProps => {
  return {
    onDirty: (realtime: any, dirty: boolean, quest: QuestType, text: string) => {

      realtime.setText(text);

      if (!dirty) {
        dispatch(setDirty(true));
        setTimeout(function() { dispatch(saveQuest(quest)); }, 5000);
      }
    }
  };
}

const QuestIDEContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestIDE);

export default QuestIDEContainer