import { connect } from 'react-redux'
import {setCodeView, setDirty, CodeViews} from './actions'
import QuestIDE from './QuestIDE'
import toMarkdown from '../../translation/to_markdown'

var buffer;

function getVisibleCode(xml = "", tab) {
  switch (tab) {
    case CodeViews.XML:
      return xml;
    case CodeViews.MARKDOWN:
      return toMarkdown(xml);
    default:
      return xml;
  }
}

const mapStateToProps = (state, ownProps) => {
  buffer = getVisibleCode(state.editor.xml, state.editor.view);

  return {
    text: buffer,
    tab: state.editor.view,
    dirty: state.dirty
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onTabChange: (currTab, nextTab, cb) => {
      dispatch(setCodeView(currTab, buffer, nextTab, cb));
    },
    onDirty: (dirty, text) => {
      buffer = text;
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