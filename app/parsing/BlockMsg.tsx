import {Block} from './BlockList'

export type BlockMsgType = 'warning' | 'error' | 'debug';

export interface BlockMsg {
  blockGroup: Block[];
  type: BlockMsgType;
  text: string;

  // If this message is for a particular line, set this value here.
  // Otherwise we assume it applies to the whole block group.
  line?: number;

  // URL is a path relative to the documentation root (GITHUB_DOCS). This URL
  // should provide more information on the error (e.g. examples
  // of correct and incorrect behavior).
  url: string;
}


export function prettifyMsg(msg: BlockMsg): string {
  var result = "";

  var line = msg.line || (msg.blockGroup[0] && msg.blockGroup[0].startLine);

  result += msg.type.toUpperCase();
  result += " L" + ((line !== undefined) ? line : "none");
  result += " (" + msg.blockGroup.length + " blocks):\n";
  result += msg.text;

  if (msg.url) {
    result += "\nURL: " + msg.url;
  }

  return result;
}

export function prettifyMsgs(msgs: BlockMsg[]): string {
  var prettyMsgs: string[] = [];
  for (var i = 0; i < msgs.length; i++) {
    prettyMsgs.push(prettifyMsg(msgs[i]));
  }
  return prettyMsgs.join('\n\n');
}

export class BlockMsgHandler {
  private debug: string[];
  private messages: BlockMsg[];
  private context: Block[];

  constructor(blockContext?: Block[]) {
    this.debug = [];
    this.messages = [];
    this.context = blockContext || [];
  }

  dbg(text: string) {
    this.debug.push(text);
  }

  err(text: string, url: string, line?: number) {
    this.msg(
      this.context,
      'error',
      text,
      url,
      line
    );
  }

  warn(text: string, url: string, line?: number) {
    this.msg(
      this.context,
      'warning',
      text,
      url,
      line
    );
  }

  extend(msgs: BlockMsg[]) {
    Array.prototype.push.apply(this.messages, msgs);
  }

  finalize(): BlockMsg[] {
    if (this.debug.length > 0) {
      this.msg(
        this.context,
        'debug',
        this.debug.join('\n'),
        '404'
      );
    }
    return this.messages;
  }

  private msg(group: Block[], type: 'warning'|'error'|'debug', text: string, url: string, line?: number) {
    var message: BlockMsg = {
      blockGroup: group,
      type: type,
      text: text,
      url: url
    };
    if (line) {
      message.line = line;
    }
    this.messages.push(message);
  }
};