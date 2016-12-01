/// <reference path="../../typings/es6-shim/es6-shim.d.ts" />

import {Renderer} from './render/Renderer'
import {BlockRenderer} from './render/BlockRenderer'
import {XMLRenderer} from './render/XMLRenderer'
import {Block, BlockList} from './block/BlockList'
import {Normalize} from './validation/Normalize'
import {LogMessage, LogMessageMap, Logger} from './Logger'

export function renderXML(md: string): QDLParser {
  var qdl = new QDLParser(XMLRenderer);
  qdl.render(new BlockList(md));
  return qdl;
}

export class QDLParser {
  private renderer: BlockRenderer;
  private result: any;
  private log: Logger;
  private blockList: BlockList;
  private reverseLookup: {[n: number]: number};

  constructor(renderer: Renderer) {
    this.renderer = new BlockRenderer(renderer);
    this.result = null;
  }

  render(blockList: BlockList) {
    this.log = new Logger();
    if (!blockList || blockList.length === 0) {
      this.result = this.renderer.finalize([], this.log);
      return;
    }
    this.blockList = blockList;

    var groups = this.getBlockGroups();
    this.log.dbg("Block groups:");
    this.log.dbg(JSON.stringify(groups));

    var indents = Object.keys(groups).sort();

    // Step through indents from most to least,
    // rendering the dependencies of lesser indents as we go.
    for (var i = indents.length-1; i >= 0; i--) {
      var indentGroups = groups[indents[i]];
      for (var j = 0; j < indentGroups.length; j++) {
        // construct the render list of blocks.
        // This is a list of unrendered blocks in the group,
        // plus injected 'rendered' blocks that
        var group = indentGroups[j];

        if (group.length === 0) {
          continue;
        }

        this.log.extend(this.renderSegment(indents[i+1], group[0], group[group.length-1]));
      }
    }

    // Do final processing (e.g. putting all values inside of the first block <quest> tag)
    var zeroIndentBlockRoots: Block[] = [];
    // TODO: Find actual min
    var minIndent = '0';
    for (var i = 0; i < groups[minIndent].length; i++) {
      // Append the first blocks in each group to the render list.
      zeroIndentBlockRoots.push(this.blockList.at(groups[minIndent][i][0]));
    }
    this.result = this.renderer.finalize(zeroIndentBlockRoots, this.log);

    // Validate the result
    // TODO
    //this.log.extend(this.validate(this.blockList.at(0).render));

    // Create a reverse lookup of block => root block
    // for use by getResultAt()
    this.reverseLookup = {};
    for (var i = 0; i < indents.length; i++) {
      var indentGroups = groups[indents[i]];
      for (var j = 0; j < indentGroups.length; j++) {
        var group = indentGroups[j];
        for (var k = 0; k < group.length; k++) {
          this.reverseLookup[group[k]] = group[0];
        }
      }
    }
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
    for (var i = 0; i < this.blockList.length; i++) {
      var block = this.blockList.at(i);
      if (block.startLine <= line && block.startLine + block.lines.length > line) {
        return this.blockList.at(this.reverseLookup[i]).render;
      }
    }
    return null;
  }

  public getMeta(): {[k: string]: any} {
    return this.renderer.toMeta(this.blockList.at(0), null);
  }

  private hasHeader(block: Block): boolean {
    return (
      block &&
      block.lines.length &&
      block.lines[0].length &&
      (block.lines[0][0] === '_' ||
       block.lines[0][0] === '#' ||
       block.lines[0].indexOf('**') === 0)
    );
  }

  private getBlockGroups(): ({[indent:string]: number[][]}) {
    // Group blocks by indent.
    // Blocks are grouped up to the maximum indent level
    var groups: {[indent:string]: number[][]} = {};
    for (var i = 0; i < this.blockList.length; i++) {
      var curr = this.blockList.at(i);

      if (!groups[curr.indent]) {
        groups[curr.indent] = [[]];
      }

      // If we're a titled block, break the block group at the same indent
      if (this.hasHeader(curr) && groups[curr.indent][groups[curr.indent].length-1].length > 0) {
        groups[curr.indent].push([]);
      }

      groups[curr.indent][groups[curr.indent].length-1].push(i);

      // Break all deeply-indented groups that have a larger indent
      var indents: any = Object.keys(groups).sort(function(a: any, b: any){return a-b;});
      for (var j = indents.length-1; indents[j] > curr.indent; j--) {
        var jlen = groups[indents[j]].length;
        if (groups[indents[j]][jlen-1].length > 0) {
          groups[indents[j]].push([]);
        }
      }
    }
    return groups;
  }



  public getFinalizedLogs(): LogMessageMap {
    var finalized = this.log.finalize();
    this.log = null;

    var logMap: LogMessageMap = {'info': [], 'warning': [], 'error': []};
    for (let m of finalized) {
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
        default:
          throw new Error('Unknown message type ' + m.type);
      }
    }
    return logMap;
  }

  private renderSegment(nextIndent: string, startBlockIdx: number, endBlockIdx: number) {
    // Precondition: All blocks with indent greater than the starting block
    // have already been rendered and has a .render property set (i.e. not undefined)

    // Base indent is determined by the start block.
    var baseIndent = this.blockList.at(startBlockIdx).indent;

    // We must check if the block *after* endBlockIdx is nextIndent-ed, because this indicates
    // more blocks must be added to the render list.
    // In this case, we redefine endBlockIdx to be the last nextIndent block before
    // the next baseIndent block.
    var afterBlock = this.blockList.at(endBlockIdx+1);
    if (afterBlock && ''+afterBlock.indent === nextIndent) {
      do {
        endBlockIdx++;
        afterBlock = this.blockList.at(endBlockIdx+1);
      } while(afterBlock && afterBlock.indent > baseIndent);
    }

    // Loop through *all* blocks between start and end idx.
    // We need blocks that aren't rendered
    var toRender: Block[] = [];

    for (var i = startBlockIdx; i <= endBlockIdx; i++) {
      var block = this.blockList.at(i);

      // Add unrendered baseIndent blocks and meaningfully-rendered nextIndent blocks.
      if (block.render === undefined) {
        if (block.indent !== baseIndent) {
          throw new Error("Internal render error: found unrendered non-baseIndent block");
        }
        toRender.push(block);
      } else if (nextIndent !== undefined) {
        if (''+block.indent !== nextIndent || block.render === null) {
          continue;
        }
        toRender.push(block);
      }
    }

    return this.renderBlockList(toRender);
    // Postcondition: Every block from startLine to endLine must have a set .render property (anything but 'undefined')
  }

  private renderBlockList(blocks: Block[]): LogMessage[] {
    if (!blocks.length) {
      throw new Error("Empty or null block set given");
    }
    if (blocks[0].render) {
      // Zeroth block should never be rendered
      throw new Error("Internal render error: found rendered zeroth block");
    }

    var log = new Logger(blocks);

    // First line of first block is always a header of some kind.
    var headerLine = blocks[0].lines[0];

    var lines = '';
    for (let b of blocks) {
      lines += ' ' + b.startLine;

      // Explicitly mark each block as 'seen'
      if (b.render === undefined) {
        b.render = null;
      }
    }
    log.dbg("Rendering block group:" + lines);


    if (headerLine[0] === '#') {
      if (blocks.length !== 1) {
        log.err(
          'quest block group cannot contain multiple blocks',
          '404'
        );
      }
      this.renderer.toQuest(blocks[0], log);
    } else if (headerLine.indexOf('_combat_') === 0) { // Combat card
      this.renderer.toCombat(blocks, log);
    } else if (headerLine.indexOf('**end**') === 0) { // End trigger
      this.renderer.toTrigger(blocks, log);
    } else { // Roleplay header
      this.renderer.toRoleplay(blocks, log);
    }

    return log.finalize();
  }
}