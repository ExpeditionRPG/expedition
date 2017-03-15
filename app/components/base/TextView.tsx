import * as React from 'react'
import brace from 'brace'
import AceEditor from 'react-ace'

import 'brace/ext/searchbox'
import 'brace/mode/markdown'
import 'brace/theme/twilight'

const acequire: any = (require('brace') as any).acequire;
const {Range} = acequire('ace/range');

import {QDLMode} from './QDLMode'
import {AnnotationType} from '../../reducers/StateTypes'
import Spellcheck from '../../spellcheck'
const mode = new QDLMode();

declare var gapi: any;
declare var window:any;

interface TextViewProps extends React.Props<any> {
  onChange: any;
  onLine: any;
  realtime: any;
  annotations: AnnotationType[];

  // Use of SplitPane interferes with JS resize and rerendering.
  // When this value changes, the text view re-renders and the
  // correct vertical height is set.
  lastSizeChangeMillis: number;
}

// See https://github.com/securingsincity/react-ace
export default class TextView extends React.Component<TextViewProps, {}> {
  ace: any;
  spellchecker: any;
  onSelectionChange: () => any;
  silentChange: boolean;
  silentSelectionChangeTimer: any;

  getValue() {
    if (this.ace) {
      return this.ace.editor.getValue();
    }
    return '';
  }

  setValue(value: string) {
    if (this.ace) {
      this.ace.editor.setValue(value);
    }
  }

  onRef(ref: any) {
    if (this.ace && this.onSelectionChange) {
      this.ace.editor.off('changeSelection', this.onSelectionChange);
    }

    this.ace = ref;

    // Add a selection change listener. Because of how
    // ace handles selection events (i.e. badly) we must
    // debounce self to prevent many duplicate line events.
    this.onSelectionChange = (() => {
      if (this.silentSelectionChangeTimer) {
        clearTimeout(this.silentSelectionChangeTimer);
      }
      this.silentSelectionChangeTimer = setTimeout(() => {
        this.silentSelectionChangeTimer = null;
        var selection = this.ace.editor.getSelection();
        var lead = selection.selectionLead;
        var anchor = selection.anchor;
        if (lead.row != anchor.row || lead.column != anchor.column) {
          return;
        }
        if (this.props.onLine) {
          this.props.onLine(anchor.row);
        }
      }, 50);
    });

    if (this.ace) {
      // Must manually resize on re-render to account for SplitPane
      // adjusting the vertical height of Ace.
      ref.editor.resize();
      const session = ref.editor.getSession();

      // Once dictionary ready & document loaded, spellcheck!
      if (!this.spellchecker && window.dictionary && this.ace.editor.session.getDocument().getLength() > 1) {
        this.spellchecker = new Spellcheck(session, window.dictionary);
        session.on('change', () => { this.spellchecker.onChange(); });
        setInterval(() => { this.spellchecker.spellcheck(); }, 500);
      }

      // "Automatically scrolling cursor into view after selection change
      // self will be disabled in the next version set
      // editor.$blockScrolling = Infinity to disable self message"
      ref.editor.$blockScrolling = Infinity;

      // Set our custom mode and folding. DUCT TAPE!!!
      session.$mode = mode;
      session.$foldMode = mode.foldingRules;
      session.getFoldWidget = function(row: number) { return mode.foldingRules.getFoldWidget(session, '', row); };
      session.getFoldWidgetRange = function(row: number) { return mode.foldingRules.getFoldWidgetRange(session, '', row); };
      ref.editor.getSession().bgTokenizer.setTokenizer(mode.getTokenizer());

      // Additional configuration
      ref.editor.setOption('tabSize', 2);
      ref.editor.setOption('wrapBehavioursEnabled', true);
      ref.editor.setOption('wrap', true);
      ref.editor.setOption('useSoftTabs', true);

      ref.editor.on('changeSelection', this.onSelectionChange);

      if (this.props.annotations) {
        session.setAnnotations(this.props.annotations);
      }
    }
  }

  onTextInserted(event: any) {
    if (event.isLocal) {
      return;
    }
    var doc = this.ace.editor.session.getDocument();
    this.silentChange = true;
    doc.insert(doc.indexToPosition(event.index, 0), event.text);
    this.silentChange = false;
  }

  onTextDeleted(event: any) {
    if (event.isLocal) {
      return;
    }
    var doc = this.ace.editor.session.getDocument();
    this.silentChange = true;
    var start = doc.indexToPosition(event.index, 0);
    var end = doc.indexToPosition(event.index + event.text.length, 0);
    doc.remove(new Range(start.row, start.column, end.row, end.column));
    this.silentChange = false;
  }

  componentWillReceiveProps(newProps: any) {
    // Ensure we're registered to the newest realtime value.
    if (this.props.realtime) {
      this.props.realtime.removeAllEventListeners();
    }
    newProps.realtime.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, this.onTextInserted);
    newProps.realtime.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, this.onTextDeleted);
  }

  onChange(text: string) {
    if (this.silentChange) {
      return;
    }

    if (this.props.realtime) {
      this.props.realtime.setText(text);
    }

    if (this.props.onChange) {
      this.props.onChange(text);
    }
  }

  render() {
    var text = 'Loading...';
    if (this.props.realtime) {
      text = this.props.realtime.getText();
    }

    return (
      <AceEditor
        ref={this.onRef.bind(this)}
        mode="markdown"
        theme="twilight"
        fontSize={20}
        onChange={(text: string) => this.onChange(text)}
        width="100%"
        height="100%"
        name={'editor'}
        value={text}
      />
    );
  }
}
