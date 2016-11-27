// LiveQDL is a stateful QDL parsing utility that handles incremental changes in
// quest code, compiling as needed and allowing for real-time updates in the
// companion app preview.
//
// Goals:
// - Snapping user cursor to position when choice clicked
// - Showing errors in Ace gutter
// - Updating preview body in real time

import {QDLRenderer} from './QDLRenderer'
import {BlockList} from './BlockList'
import {BlockMsg, BlockMsgMap} from './BlockMsg'
import {BlockRenderer, XMLRenderer} from './BlockRenderer'

export function renderXML(md: string, cb: (xml: any, msgs: BlockMsgMap) => any): void {
  var qdl = new QDLRenderer(XMLRenderer);
  qdl.render(new BlockList(md));
  cb(qdl.getResult().get(0), qdl.getFinalizedMsgs());
}

export class QDL {
  private line: number;
  private onXMLCallback: (xml: any) => void;
  private onDebugCallback: (msgs: BlockMsg[]) => void;
  private onWarningCallback: (msgs: BlockMsg[]) => void;
  private onErrorCallback: (msgs: BlockMsg[]) => void;
  private onCardCallback: (card: any) => void;
  private renderer: QDLRenderer;

  constructor(renderer: BlockRenderer) {
    this.renderer = new QDLRenderer(renderer);
    this.line = 0;
  }

  onXML(handler: (xml: any) => void) {
    this.onXMLCallback = handler;
  }

  onDebug(handler: (msgs: BlockMsg[]) => void) {
    this.onDebugCallback = handler;
  }

  onWarning(handler: (msgs: BlockMsg[]) => void) {
    this.onWarningCallback = handler;
  }

  onError(handler: (msgs: BlockMsg[]) => void) {
    this.onErrorCallback = handler;
  }

  onCard(handler: (card: any) => void) {
    this.onCardCallback = handler;
  }

  // This sets the context to be returned by LiveQDL on update.
  // LP will mutate the dom element and render
  // updates made to the block containing the line number.
  setLine(line: number) {
    this.line = line;
  }

  // Parses and renders md using the supplied renderer, then
  // dispatches xml, messages, and the current line's xml
  // to the handlers.
  update(md: string) {
    this.renderer.render(new BlockList(md));

    if (this.onDebugCallback || this.onWarningCallback || this.onErrorCallback) {
      var msgs = this.renderer.getFinalizedMsgs();
      if (this.onDebugCallback && msgs['info'].length !== 0) {
        this.onDebugCallback(msgs['info']);
      }
      if (this.onWarningCallback && msgs['warning'].length !== 0) {
        this.onWarningCallback(msgs['warning']);
      }
      if (this.onErrorCallback && msgs['error'].length !== 0) {
        this.onErrorCallback(msgs['error']);
      }
    }

    if (this.onXMLCallback) {
      this.onXMLCallback(this.renderer.getResult());
    }

    if (this.onCardCallback) {
      this.onCardCallback(this.renderer.getResultAt(this.line));
    }
  }
};