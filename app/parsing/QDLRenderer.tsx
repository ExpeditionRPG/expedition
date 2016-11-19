
import {BlockRenderer} from './BlockRenderer'
import {Block, BlockList} from './BlockList'
import {BlockMsg, BlockMsgHandler} from './BlockMsg'

export class QDLRenderer {
  private renderer: BlockRenderer;
  private result: any;
  private msg: BlockMsgHandler;
  private blockList: BlockList;

  constructor(renderer: BlockRenderer) {
    this.renderer = renderer;
    this.result = null;
  }

  _hasHeader(block: Block): boolean {
    return block && block.lines.length && block.lines[0].length && (block.lines[0][0] === '_' || block.lines[0][0] === '#');
  }

  _getBlockGroups(): ({[indent:string]: number[][]}) {
    // Group blocks by indent.
    // Blocks are grouped up to the maximum indent level
    var groups: {[indent:string]: number[][]} = {};
    for (var i = 0; i < this.blockList.length; i++) {
      var curr = this.blockList.at(i);

      if (!groups[curr.indent]) {
        groups[curr.indent] = [[]];
      }

      // If we're a titled block, break the block group at the same indent
      if (this._hasHeader(curr) && groups[curr.indent][groups[curr.indent].length-1].length > 0) {
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

  render(blockList: BlockList) {
    this.msg = new BlockMsgHandler();
    this.blockList = blockList;

    var groups = this._getBlockGroups();
    this.msg.dbg("Block groups:");
    this.msg.dbg(JSON.stringify(groups));

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

        this.msg.extend(this._renderSegment(indents[i+1], group[0], group[group.length-1]));
      }
    }

    // Do final processing (e.g. putting all values inside of the first block <quest> tag)
    this.msg.extend(this._finalize(groups[indents[0]]));

    // Validate the result
    this.msg.extend(this.validate(this.blockList.at(0).render));

    this.result = this.blockList.at(0).render;
  }

  validate(quest: any): BlockMsg[] {
    // TODO:
    // - Validate quest attributes (use whitelist)
    // - Ensure there's at least one node that isn't the quest
    // - Ensure all paths end with an "end" trigger
    // - Ensure all combat events make sense (currently "win" and "lose")
    // - Ensure all combat enemies are valid (use whitelist)
    // - Validate roleplay attributes (w/ whitelist)
    // - Validate choice attributes (w/ whitelist)
    return [];
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
    console.log("todo getResultAt");
    return '';
  }

  public getFinalizedMsgs(): ({[type: string]: BlockMsg[]}) {
    var finalized = this.msg.finalize();
    this.msg = null;

    var msgMap: {[type: string]: BlockMsg[]} = {'debug': [], 'warning': [], 'error': []};
    for (let m of finalized) {
      msgMap[m.type].push(m);
    }
    return msgMap;
  }

  _renderSegment(nextIndent: string, startBlockIdx: number, endBlockIdx: number) {
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

    return this._renderBlockList(toRender);
    // Postcondition: Every block from startLine to endLine must have a set .render property (anything but 'undefined')
  }

  _renderBlockList(blocks: Block[]): BlockMsg[] {
    if (!blocks.length) {
      throw new Error("Empty or null block set given");
    }
    if (blocks[0].render) {
      // Zeroth block should never be rendered
      throw new Error("Internal render error: found rendered zeroth block");
    }

    var msg = new BlockMsgHandler(blocks);

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
    msg.dbg("Rendering block group:" + lines);


    if (headerLine[0] === '#') {
      this.renderer.toQuest(blocks, msg);
    } else if (headerLine.indexOf('_combat_') === 0) { // Combat card
      this.renderer.toCombat(blocks, msg);
    } else if (headerLine.indexOf('_end_') === 0) { // End trigger
      this.renderer.toTrigger(blocks, msg);
    } else { // Roleplay header
      this.renderer.toRoleplay(blocks, msg);
    }

    return msg.finalize();
  }


  _finalize(zeroIndentGroups: number[][]): BlockMsg[] {
    var toRender: Block[] = [];

    // Append the first blocks in each group to the render list.
    for (var i = 0; i < zeroIndentGroups.length; i++) {
      toRender.push(this.blockList.at(zeroIndentGroups[i][0]));
    }

    // The renderer finalizes these top-level rendered blocks.
    // This is treated differently than regular calls to renderer() because
    // the first block has a render defined.
    var msg = new BlockMsgHandler([]);
    this.renderer.finalize(toRender, msg);

    return msg.finalize();
  }
}