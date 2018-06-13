import * as React from 'react'
import AceEditorOrig from 'react-ace'
import 'brace/ext/searchbox'
import 'brace/mode/markdown'
import 'brace/theme/twilight'
import {QDLMode} from './QDLMode'
import {AnnotationType} from '../../reducers/StateTypes'
import Spellcheck from '../../Spellcheck'

// The current version of AceEditor fails to compile when used as a JSX.Element:
/*
  JSX element type 'AceEditor' is not a constructor function for JSX elements.
  Types of property 'setState' are incompatible.
    Type '{ <K extends never>(f: (prevState: undefined, props: AceEditorProps) => Pick<undefined, K>, callb...' is not assignable to type '{
 <K extends never>(f: (prevState: {}, props: any) => Pick<{}, K>, callback?: (() => any) | undef...'.
      Types of parameters 'f' and 'f' are incompatible.
        Types of parameters 'prevState' and 'prevState' are incompatible.
          Type 'undefined' is not assignable to type '{}'.
*/
// I suspect this can be fixed by upgrading Ace, but that's likely to break other things.
// See https://github.com/ExpeditionRPG/expedition-quest-creator/issues/466

declare var gapi: any;
declare var window:any;

const AceEditor = AceEditorOrig as any;
const acequire: any = (require('brace') as any).acequire;
const {Range} = acequire('ace/range');
const mode = new QDLMode();

type AceAnnotation = {row: number, column: number, text: string, type: 'error'|'info'|'warning'};

interface TextViewProps extends React.Props<any> {
  annotations: AnnotationType[];
  onChange: (text: string) => any;
  onLine: (line: number) => any;
  onAnnotationClick: (annotations: number[]) => any;
  realtime: any;
  realtimeModel: any;

  // Use of SplitPane interferes with JS resize and rerendering.
  // When this value changes, the text view re-renders and the
  // correct vertical height is set.
  lastSizeChangeMillis: number;

  // Hook for external control of scroll position
  scrollLineTarget?: number;
  scrollLineTargetTs?: number;

  showLineNumbers?: boolean;
  showSpellcheck?: boolean;
}

// This class wraps the Realtime API undo commands in a way
// that can substitute for Ace UndoManager. This is injected
// into the editor via session.setUndoManager().
// https://developers.google.com/google-apps/realtime/undo
// https://github.com/ajaxorg/ace/blob/v1.1.4/lib/ace/undomanager.js
class RealtimeUndoManager {
  private realtimeModel: any;

  constructor(realtimeModel: any) {
    this.realtimeModel = realtimeModel;
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
    this.realtimeModel.redo();
  }

  public undo(): void {
    if (!this.hasUndo()) {
      return;
    }
    this.realtimeModel.undo();
  }

  public reset(): void {
    // No-op for now, but part of the Ace UndoManager interface.
  }

  public markClean(): void {
    // No-op for now
  }

  public isClean(): boolean {
    // Currently not supported. We check dirtyness via value anyways.
    return false;
  }
}

// See https://github.com/securingsincity/react-ace
export default class TextView extends React.Component<TextViewProps, {}> {
  ace: any;
  focused: boolean;
  lineChangeTs: number;
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
        const selection = this.ace.editor.getSelection();
        const lead = selection.selectionLead;
        const anchor = selection.anchor;
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

      if (this.props.realtimeModel) {
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
      ref.editor.on('gutterclick', (e: any) => {this.onGutterClick(e)});

      if (this.props.annotations) {
        session.setAnnotations(this.props.annotations);
      }
    }
  }

  onGutterClick(event: any) {
    const path: Element[] = event.domEvent.path;
    if (!path || !path.length) {
      return;
    }

    const ICON_CLASSES = ['ace_error', 'ace_warning', 'ace_info']
    let isIcon = false;
    for (const c of path[0].classList) {
      if (ICON_CLASSES.indexOf(c) !== -1) {
        isIcon = true;
        break;
      }
    }

    if (!isIcon) {
      return;
    }
    const textInt = path[0].textContent;
    if (textInt === null) {
      throw new Error('Could not parse gutter index');
    }
    const rowNum = parseInt(textInt, 10) - 1;
    const annotations: number[] = event.editor.session.getAnnotations().map((a: AceAnnotation) => {
      if (a.row !== rowNum) {
        return null;
      }

      const m = a.text.match(/^\w+ (\d+):/);
      if (!m) {
        return null;
      }
      return parseInt(m[1], 10);
    }).filter((n?: number) => {return n;});
    this.props.onAnnotationClick(Array.from(new Set(annotations)));
    event.preventDefault();
  }

  onTextInserted(event: any) {
    if (!this.ace || event.isLocal && !event.isRedo && !event.isUndo) {
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
      this.ace.editor.gotoLine(end.row+1, end.column);
    }
  }

  onTextDeleted(event: any) {
    if (!this.ace || event.isLocal && !event.isRedo && !event.isUndo) {
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

    // If we've been supplied with a different line number, scroll to it
    if (this.ace) {
      const row = this.ace.editor.getSelection().anchor.row;
      if (!this.focused && newProps.scrollLineTarget !== row && newProps.scrollLineTargetTs > (this.lineChangeTs || -1)) {
        this.ace.editor.gotoLine(newProps.scrollLineTarget+1, 0, true);
        this.lineChangeTs = newProps.scrollLineTargetTs;
      }
    }
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
    let text = 'Loading...';
    if (this.props.realtime) {
      text = this.props.realtime.getText();
    }

    const classes = ['ace'];
    if (!this.props.showLineNumbers) {
      classes.push('noLineNumbers');
    }
    if (!this.props.showSpellcheck) {
      classes.push('noSpellcheck');
    }

    return (
      <AceEditor
        className={classes.join(' ')}
        ref={this.onRef.bind(this)}
        mode="markdown"
        theme="twilight"
        fontSize={20}
        onBlur={() => this.focused = false}
        onChange={(text: string) => this.onChange(text)}
        onFocus={() => this.focused = true}
        width="100%"
        height="100%"
        name={'editor'}
        value={text}
      />
    );
  }
}
