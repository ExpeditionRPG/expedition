import {Renderer} from './render/Renderer'
import {BlockRenderer} from './render/BlockRenderer'
import {XMLRenderer} from './render/XMLRenderer'
import {Block, BlockList} from './block/BlockList'
import {LogMessage, LogMessageMap, Logger} from './Logger'
import REGEX from '../Regex'

export function renderXML(md: string): QDLParser {
  const qdl = new QDLParser(XMLRenderer);
  qdl.render(new BlockList(md));
  return qdl;
}

export class QDLParser {
  private renderer: BlockRenderer;
  private result: any;
  private log: Logger | null;
  private blockList: BlockList;
  private reverseLookup: {[n: number]: number};

  constructor(renderer: Renderer) {
    this.renderer = new BlockRenderer(renderer);
    this.result = null;
  }

  public render(blockList: BlockList) {
    const startTime = Date.now();
    this.log = blockList.logger || new Logger();
    if (!blockList || blockList.length === 0) {
      this.result = this.renderer.finalize([], this.log);
      return;
    }
    this.blockList = blockList;

    const groups = this.getBlockGroups();
    this.log.dbg('Block groups:');
    this.log.dbg(JSON.stringify(groups));

    const indents = Object.keys(groups).sort((a: string, b: string) => { return (parseInt(a, 10) - parseInt(b, 10)); }); // numeric strings

    // Step through indents from most to least,
    // rendering the dependencies of lesser indents as we go.
    for (let i = indents.length-1; i >= 0; i--) {
      const indentGroups = groups[indents[i]];
      for (let j = 0; j < indentGroups.length; j++) {
        // construct the render list of blocks.
        // This is a list of unrendered blocks in the group,
        // plus injected 'rendered' blocks that
        const group = indentGroups[j];

        if (group.length === 0) {
          continue;
        }

        this.log.extend(this.renderSegment(indents[i+1], group[0], group[group.length-1]));
      }
    }

    // Do final processing (e.g. putting all values inside of the first block <quest> tag)
    const zeroIndentBlockRoots: Block[] = [];
    // TODO: Find actual min
    const minIndent = '0';
    for (let i = 0; i < groups[minIndent].length; i++) {
      // Append the first blocks in each group to the render list.
      zeroIndentBlockRoots.push(this.blockList.at(groups[minIndent][i][0]));
    }
    this.result = this.renderer.finalize(zeroIndentBlockRoots, this.log);

    // Validate the result
    // this.log.extend(this.renderer.validate(this.blockList.at(0).render));

    // Create a reverse lookup of block => root block
    // for use by getResultAt()
    this.reverseLookup = {};
    for (let i = 0; i < indents.length; i++) {
      const indentGroups = groups[indents[i]];
      for (let j = 0; j < indentGroups.length; j++) {
        const group = indentGroups[j];
        for (let k = 0; k < group.length; k++) {
          this.reverseLookup[group[k]] = group[0];
        }
      }
    }

    this.log.dbg('XML rendered in ' + (Date.now() - startTime) + 'ms');
  }

  // Returns a rendered version of the current markdown document.
  // This is failure-tolerant: any blocks that fail to compile
  // are shown as "error card" placeholders.
  public getResult(): any {
    // The first block is always the root quest element.
    // Since render is called on update, it should be valid XML always.
    return this.result;
  }

  public getResultAt(line: number): any {
    if (!this.blockList) {
      return null;
    }

    // Linear search until we feel the slow down.
    // In the future, we could binary-search to get the correct block.
    for (let i = 0; i < this.blockList.length; i++) {
      const block = this.blockList.at(i);
      if (block.startLine <= line && block.startLine + block.lines.length > line) {
        return this.blockList.at(this.reverseLookup[i]).render;
      }
    }
    return null;
  }

  public getMeta(): {[k: string]: any} {
    if (!this.blockList) {
      return {};
    }
    return this.renderer.toMeta(this.blockList.at(0), undefined);
  }

  private hasHeader(block: Block): boolean {
    return (
      Boolean(block) &&
      Boolean(block.lines.length) &&
      Boolean(block.lines[0].length) &&
      (block.lines[0][0] === '_' ||
       block.lines[0][0] === '#' ||
       REGEX.TRIGGER.test(block.lines[0]))
    );
  }

  private getBlockGroups(): ({[indent:string]: number[][]}) {
    // Group blocks by indent.
    // Blocks are grouped up to the maximum indent level
    const groups: {[indent:string]: number[][]} = {};

    for (let i = 0; i < this.blockList.length; i++) {
      const curr = this.blockList.at(i);

      if (!groups[curr.indent]) {
        groups[curr.indent] = [[]];
      }

      // If we're a titled block, break the block group at the same indent
      if (this.hasHeader(curr) && groups[curr.indent][groups[curr.indent].length-1].length > 0) {
        groups[curr.indent].push([]);
      }

      groups[curr.indent][groups[curr.indent].length-1].push(i);

      // Trigger blocks are always singular blocks, so break them afterwards, too
      if (curr && curr.lines.length && curr.lines[0].length && REGEX.TRIGGER.test(curr.lines[0])) {
        if (i === this.blockList.length-1) {
          // don't add a blank block as the very last block
        } else {
          groups[curr.indent].push([]);
        }
      }

      // Break all deeply-indented groups that have a larger indent
      const indents: any = Object.keys(groups).sort((a: any, b: any) => {return a-b;});
      for (let j = indents.length-1; indents[j] > curr.indent; j--) {
        const jlen = groups[indents[j]].length;
        if (groups[indents[j]][jlen-1].length > 0) {
          groups[indents[j]].push([]);
        }
      }
    }
    return groups;
  }

  public getFinalizedLogs(): LogMessageMap {
    if (!this.log) {
      throw new Error('No log assigned to QDLParser');
    }
    const finalized = this.log.finalize();
    this.log = null;

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
          const log = new Logger();
          log.internal('Unknown message type', '506');
          Array.prototype.push.apply(logMap.internal, log.finalize());
          break;
      }
    }
    return logMap;
  }

  private renderSegment(nextIndent: string, startBlockIdx: number, endBlockIdx: number): LogMessage[] {
    // Precondition: All blocks with indent greater than the starting block
    // have already been rendered and has a .render property set (i.e. not undefined)

    // Base indent is determined by the start block.
    const baseIndent = this.blockList.at(startBlockIdx).indent;

    // We must check if the block *after* endBlockIdx is nextIndent-ed, because this indicates
    // more blocks must be added to the render list.
    // In this case, we redefine endBlockIdx to be the last nextIndent block before
    // the next baseIndent block.
    let afterBlock = this.blockList.at(endBlockIdx+1);
    if (afterBlock && ''+afterBlock.indent === nextIndent) {
      do {
        endBlockIdx++;
        afterBlock = this.blockList.at(endBlockIdx+1);
      } while(afterBlock && afterBlock.indent > baseIndent);
    }

    // Loop through *all* blocks between start and end idx.
    // We need blocks that aren't rendered
    const toRender: Block[] = [];
    const log = new Logger();
    for (let i = startBlockIdx; i <= endBlockIdx; i++) {
      const block = this.blockList.at(i);

      // Add unrendered baseIndent blocks and meaningfully-rendered nextIndent blocks.
      if (block.render === undefined) {
        if (block.indent !== baseIndent) {
          const l2 = new Logger([block]);
          l2.internal('found unrendered non-baseIndent block', '507');
          log.extend(l2.finalize());
        }
        toRender.push(block);
      } else if (nextIndent !== undefined) {
        if ('' + block.indent !== nextIndent || block.render === null) {
          continue;
        }
        toRender.push(block);
      }
    }

    log.extend(this.renderBlockList(toRender));
    return log.finalize();
    // Postcondition: Every block from startLine to endLine must have a set .render property (anything but 'undefined')
  }

  private renderBlockList(blocks: Block[]): LogMessage[] {
    const log = new Logger(blocks);

    if (!blocks.length) {
      log.internal('empty or null block set given', '508');
      return log.finalize();
    }
    if (blocks[0].render) {
      // Zeroth block should never be rendered
      log.internal('found rendered zeroth block', '509');
      return log.finalize();
    }

    // First line of first block is always a header of some kind.
    const headerLine = blocks[0].lines[0];

    let lines = '';
    for (const b of blocks) {
      lines += ' ' + b.startLine;

      // Explicitly mark each block as 'seen'
      if (b.render === undefined) {
        b.render = null;
      }
    }
    log.dbg('Rendering block group:' + lines);

    if (headerLine[0] === '#') {
      if (blocks.length !== 1) {
        log.err(
          'quest block group cannot contain multiple blocks',
          '423'
        );
      }
      this.renderer.toQuest(blocks[0], log);
    } else if (headerLine.indexOf('_combat_') === 0) { // Combat card
      this.renderer.toCombat(blocks, log);
    } else if (REGEX.TRIGGER.test(headerLine)) { // Trigger
      this.renderer.toTrigger(blocks, log);
    } else { // Roleplay header
      this.renderer.toRoleplay(blocks, log);
    }

    return log.finalize();
  }
}
