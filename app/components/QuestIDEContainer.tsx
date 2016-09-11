import { connect } from 'react-redux'
import {setCodeView, setDirty} from '../actions/editor'
import {CodeViewType, AppState} from '../reducers/StateTypes'
import {pushError} from '../error'
import {getBuffer, setBuffer} from '../buffer'
import QuestIDE, {QuestIDEStateProps, QuestIDEDispatchProps} from './QuestIDE'

var toMarkdown: any = require('../../translation/to_markdown')

const mapStateToProps = (state: AppState, ownProps: any): QuestIDEStateProps => {
  return {
    text: getBuffer(),
    view: state.editor.view,
    dirty: state.dirty
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestIDEDispatchProps => {
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