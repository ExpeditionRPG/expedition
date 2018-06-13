import {Block} from './block/BlockList'

// Info: Generally not shown to the user; internal debugging only.
// Warning: Won't break your quest, but important to know about. Does not change quest.
// Error: This will break your quest; we try to automatically modify quest to make it playable
// Internal: "This should never happen", implementation issue. Encourage reporting a bug.
type LogSeverity = 'warning' | 'error' | 'info' | 'internal';

export interface LogMessage {
  type: LogSeverity;
  text: string;

  // If this message is for a particular line, set this value here.
  // Otherwise we assume it applies to the whole block group.
  line?: number;

  // URL is a path relative to the documentation root (GITHUB_DOCS). This URL
  // should provide more information on the error (e.g. examples
  // of correct and incorrect behavior).
  url: string;
}

export interface LogMessageMap {
  info: LogMessage[];
  warning: LogMessage[];
  error: LogMessage[];
  internal: LogMessage[];
}


export function prettifyMsg(msg: LogMessage): string {
  let result = '';
  result += msg.type.toUpperCase();
  result += ' L' + ((msg.line !== undefined) ? msg.line : 0);
  result += ':\n';
  result += msg.text;

  if (msg.url) {
    result += '\nURL: ' + msg.url;
  }

  return result;
}

export function prettifyMsgs(msgs: LogMessage[]): string {
  const prettyMsgs: string[] = [];
  for (let i = 0; i < msgs.length; i++) {
    prettyMsgs.push(prettifyMsg(msgs[i]));
  }
  return prettyMsgs.join('\n\n');
}

export class Logger {
  private info: string[];
  private messages: LogMessage[];
  private context: Block[];

  constructor(blockContext?: Block[]) {
    this.info = [];
    this.messages = [];
    this.context = blockContext || [];
  }

  public dbg(text: string) {
    this.info.push(text);
  }

  public internal(text: string, url: string, line?: number) {
    this.messages.push(this.msg(
      this.context,
      'internal',
      text,
      url,
      line
    ));
  }

  public err(text: string, url: string, line?: number) {
    this.messages.push(this.msg(
      this.context,
      'error',
      text,
      url,
      line
    ));
  }

  public warn(text: string, url: string, line?: number) {
    this.messages.push(this.msg(
      this.context,
      'warning',
      text,
      url,
      line
    ));
  }

  public extend(msgs: LogMessage[]) {
    Array.prototype.push.apply(this.messages, msgs);
  }

  public finalize(): LogMessage[] {
    if (this.info.length > 0) {
      this.messages.push(this.msg(
        this.context,
        'info',
        this.info.join('\n'),
        '100'
      ));
    }
    return this.messages;
  }

  public getFinalizedLogs(): LogMessageMap {
    const finalized = this.finalize();
    const logMap: LogMessageMap = {'info': [], 'warning': [], 'error': [], 'internal': []};
    for (const m of finalized) {
      switch(m.type) {
        case 'info':
          logMap.info.push(m);
          break;
        case 'warning':
          logMap.warning.push(m);
          break;
        case 'error':
          logMap.error.push(m);
          break;
        case 'internal':
          logMap.internal.push(m);
          break;
        default:
          logMap.internal.push(this.msg([], 'internal', 'Unknown message type', '506'));
          break;
      }
    }
    return logMap;
  }

  private msg(group: Block[], type: LogSeverity, text: string, url: string, line?: number): LogMessage {
    const message: LogMessage = {
      type: type,
      text: text,
      url: url
    };
    if (line) {
      message.line = line;
    } else {
      message.line = (group.length > 0) ? (group[0].startLine || 0) : 0
    }
    return message;
  }
};
