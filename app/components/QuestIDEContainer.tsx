import { connect } from 'react-redux'
import {setCodeView, setDirty} from '../actions/editor'
import {CodeViewType} from '../actions/ActionTypes'
import {pushError} from '../error'
import {getBuffer, setBuffer} from '../buffer'
import QuestIDE from './QuestIDE'

var toMarkdown: any = require('../../translation/to_markdown')

const mapStateToProps = (state: any, ownProps: any): any => {
  return {
    text: getBuffer(),
    tab: state.editor.view,
    dirty: state.dirty
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): any => {
  return {
    onTabChange: (currTab: CodeViewType, nextTab: CodeViewType, cb: any) => {
      dispatch(setCodeView(currTab, getBuffer(), nextTab, cb));
    },
    onDirty: (dirty: boolean, text: string) => {
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