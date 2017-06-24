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
import Spellcheck from '../../Spellcheck'
const mode = new QDLMode();

declare var gapi: any;
declare var window:any;

interface TextViewProps extends React.Props<any> {
  onChange: any;
  onLine: any;
  realtime: any;
  realtimeModel: any;
  annotations: AnnotationType[];

  // Use of SplitPane interferes with JS resize and rerendering.
  // When this value changes, the text view re-renders and the
  // correct vertical height is set.
  lastSizeChangeMillis: number;
}

//
// https://developers.google.com/google-apps/realtime/undo
// https://github.com/ajaxorg/ace/blob/v1.1.4/lib/ace/undomanager.js
class RealtimeUndoManager {
  private realtimeModel: any;

  constructor(realtimeModel: any) {
    this.realtimeModel = realtimeModel;
    console.log(realtimeModel);
  }

  public execute(options: any): void {
    // Throw out ace editor deltas received, since
    // we use the realtime API as a source of truth.
  }

  public hasUndo(): boolean {
    return this.realtimeModel.canUndo;
  }

  public hasRedo(): boolean {
    return this.realtimeModel.canRedo;
  }

  public redo(): void {
    if (!this.hasRedo()) {
      return;
    }
    console.log('Redoing realtime');
    this.realtimeModel.redo();
  }

  public undo(): void {
    if (!this.hasUndo()) {
      return;
    }
    console.log('Undoing realtime');
    this.realtimeModel.undo();
  }

  public reset(): void {
    // No-op for now, but part of the Ace UndoManager interface.
  }

  public markClean(): void {
    // No-op for now
  }

  public isClean(): boolean {
    return false;
  }
}

// See https://github.com/securingsincity/react-ace
export default class TextView extends React.Component<TextViewProps, {}> {
  ace: any;
  spellchecker: any;
  onSelectionChange: () => any;
  silentChange: boolean;
  silentSelectionChangeTimer: any;

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
        if (lead.row !== anchor.row || lead.column !== anchor.column) {
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
      console.log(session);

      if (this.props.realtimeModel) {
        console.log('Setting undo manager');
        this.ace.editor.getSession().setUndoManager(new RealtimeUndoManager(this.props.realtimeModel));
      }

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
    if (event.isLocal && !event.isRedo && !event.isUndo) {
      return;
    }
    const session = this.ace.editor.session;
    const doc = session.getDocument();
    this.silentChange = true;
    doc.insert(doc.indexToPosition(event.index, 0), event.text);
    this.silentChange = false;

    if (event.isLocal) {
      // Go to end of insert if we're doing a local add (redo/undo)
      const end = doc.indexToPosition(event.index + event.text.length)
      console.log(end);
      this.ace.editor.gotoLine(end.row+1, end.column);
    }
  }

  onTextDeleted(event: any) {
    if (event.isLocal && !event.isRedo && !event.isUndo) {
      return;
    }
    const session = this.ace.editor.session;
    const doc = session.getDocument();
    this.silentChange = true;
    const start = doc.indexToPosition(event.index, 0);
    const end = doc.indexToPosition(event.index + event.text.length, 0);
    doc.remove(new Range(start.row, start.column, end.row, end.column));
    this.silentChange = false;

    if (event.isLocal) {
      // Go to beginning of segment if we're doing a local remove (redo/undo)
      console.log(start);
      this.ace.editor.gotoLine(start.row+1, start.column);
    }
  }

  componentWillReceiveProps(newProps: any) {
    // Ensure we're registered to the newest realtime value.
    if (this.props.realtime) {
      this.props.realtime.removeAllEventListeners();
    }
    newProps.realtime.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, (event: any) => { this.onTextInserted(event); });
    newProps.realtime.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, (event: any) => { this.onTextDeleted(event); });
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
