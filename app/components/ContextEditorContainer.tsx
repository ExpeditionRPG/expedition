import {connect} from 'react-redux'
import {AppState} from '../reducers/StateTypes'
import ContextEditor, {ContextEditorDispatchProps, ContextEditorStateProps} from './ContextEditor'

var math = require('mathjs') as any;

const mapStateToProps = (state: AppState, ownProps: any): ContextEditorStateProps => {
  return {
    context: state.preview.quest && state.preview.quest.result && state.preview.quest.result.ctx,
    console: null,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): ContextEditorDispatchProps => {
  return {
    handleKey: function(e): boolean {
      switch (e.key) {
        case 'ArrowUp':
          var i = Math.max(this.state.idx-1, 0);
          console.log('EUP ' + i);
          if (this.state.history.length === 0) {
            this.input.value = '';
          } else {
            this.input.value = this.state.history[i];
          }
          this.setState({history: this.state.history, output: this.state.output, idx: i});
          e.stopPropagation();
          return false;
        case 'ArrowDown':
          var i = Math.min(this.state.idx+1, this.state.history.length);
          console.log('EDN ' + i);
          if (i === this.state.history.length) {
            this.input.value = "";
          } else {
            this.input.value = this.state.history[i];
          }
          this.setState({history: this.state.history, output: this.state.output, idx: i});
          e.stopPropagation();
          return false;
        case 'Enter':
          console.log("TODO eval");
          var history = this.state.history;
          history.push(this.input.value);
          var output = this.state.output;

          try {
            output.push(math.eval(this.input.value, this.newScope));
          } catch (e) {
            output.push(e.message);
          }

          this.setState({history, output, idx: history.length});
          this.input.value = '';
          console.log(history);
          return false;
        default:
          return true;
      }
    }
  };
}

const ContextEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextEditor);

export default ContextEditorContainer;