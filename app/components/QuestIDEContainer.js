import { connect } from 'react-redux'
import {setCodeView, setDirty, CodeViews} from './actions'
import {pushError} from './error'
import {getBuffer, setBuffer} from './reducers'
import QuestIDE from './QuestIDE'
import toMarkdown from '../../translation/to_markdown'

function getVisibleCode(xml = "", tab) {
  switch (tab) {
    case CodeViews.XML:
      return xml;
    case CodeViews.MARKDOWN:
      try {
        return toMarkdown(xml);
      } catch (e) {
        pushError(e);
      }
    default:
      return xml;
  }
}

const mapStateToProps = (state, ownProps) => {
  setBuffer(getVisibleCode(state.editor.xml, state.editor.view));
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