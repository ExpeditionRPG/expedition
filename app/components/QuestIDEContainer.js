import { connect } from 'react-redux'
import {setCodeView, setDirty} from '../actions/editor'
import {CodeViews} from '../actions/ActionTypes'
import {pushError} from '../error'
import {getBuffer, setBuffer} from '../buffer'
import QuestIDE from './QuestIDE'
import toMarkdown from '../../translation/to_markdown'

const mapStateToProps = (state, ownProps) => {
  return {
    text: getBuffer(),
    tab: state.editor.view,
    dirty: state.dirty
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onTabChange: (currTab, nextTab, cb) => {
      dispatch(setCodeView(currTab, getBuffer(), nextTab, cb));
    },
    onDirty: (dirty, text) => {
      setBuffer(text);
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