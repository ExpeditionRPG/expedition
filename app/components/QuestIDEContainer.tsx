import {connect} from 'react-redux'
import {setDirty} from '../actions/editor'
import {AppState} from '../reducers/StateTypes'
import {pushError} from '../error'
import {getBuffer, setBuffer} from '../buffer'
import QuestIDE, {QuestIDEStateProps, QuestIDEDispatchProps} from './QuestIDE'

var toMarkdown: any = require('../../translation/to_markdown')

const mapStateToProps = (state: AppState, ownProps: any): QuestIDEStateProps => {
  return {
    text: getBuffer(),
    dirty: state.dirty
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestIDEDispatchProps => {
  return {
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