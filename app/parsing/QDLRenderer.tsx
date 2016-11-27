
import {BlockRenderer} from './BlockRenderer'
import {Block, BlockList} from './BlockList'
import {BlockMsg, BlockMsgMap, BlockMsgHandler} from './BlockMsg'
import {questAttrValidators, requiredQuestAttrs} from './QDLAttrValidators'

const REGEXP_ITALIC = /\_(.*)\_.*/;
const REGEXP_BOLD = /\*\*(.*?)\*\*/;
const REGEXP_EVENT = /\* on (.*)/;

const ERR_PREFIX = "Internal XML Parse Error: ";

export class QDLRenderer {
  private renderer: BlockRenderer;
  private result: any;
  private msg: BlockMsgHandler;
  private blockList: BlockList;
  private reverseLookup: {[n: number]: number};

  constructor(renderer: BlockRenderer) {
    this.renderer = renderer;
    this.result = null;
  }

  _hasHeader(block: Block): boolean {
    return (
      block &&
      block.lines.length &&
      block.lines[0].length &&
      (block.lines[0][0] === '_' ||
       block.lines[0][0] === '#' ||
       block.lines[0].indexOf('**') === 0)
    );
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
    if (!blockList || blockList.length === 0) {
      this.msg.extend(this._finalize([]));
      return;
    }
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

  public getFinalizedMsgs(): BlockMsgMap {
    var finalized = this.msg.finalize();
    this.msg = null;

    var msgMap: BlockMsgMap = {'info': [], 'warning': [], 'error': []};
    for (let m of finalized) {
      switch(m.type) {
        case 'info':
          msgMap.info.push(m);
          break;
        case 'warning':
          msgMap.warning.push(m);
          break;
        case 'error':
          msgMap.error.push(m);
          break;
        default:
          throw new Error('Unknown message type ' + m.type);
      }
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
      this.toQuest(blocks, msg);
    } else if (headerLine.indexOf('_combat_') === 0) { // Combat card
      this.toCombat(blocks, msg);
    } else if (headerLine.indexOf('**end**') === 0) { // End trigger
      this.toTrigger(blocks, msg);
    } else { // Roleplay header
      this.toRoleplay(blocks, msg);
    }

    return msg.finalize();
  }

  private toRoleplay(blocks: Block[], msg: BlockMsgHandler) {
    var titleText = blocks[0].lines[0].match(REGEXP_ITALIC);

    var attribs: {[k: string]: string} = {};
    if (titleText) {
      attribs['title'] = titleText[1];

      // TODO:
      //this.applyAttributes(roleplay, blocks[0].lines[0]);

      blocks[0].lines = blocks[0].lines.splice(1);
    }

    // The only inner stuff
    var i = 0;
    var body: (string|{text: string, choice: any})[] = [];
    while (i < blocks.length) {
      var block = blocks[i];
      if (block.render) {
        // Only the blocks within choices should be rendered at this point.
        throw new Error(ERR_PREFIX + "found unexpected block with render");
      }

      // Append rendered stuff
      var lines = this.collate(block.lines);
      var choice: {text: string, choice: any};
      for (let line of lines) {
        if (line.indexOf('* ') === 0) {
          choice = {text: line.substr(1).trim(), choice: []};
          // TODO: Assert end of lines.
        } else {
          body.push(line);
        }
      }

      if (choice) {
        // If we ended in a choice, continue through subsequent blocks until we end
        // up outside the choice block again.
        var inner = blocks[++i];
        while (i < blocks.length && inner.indent !== block.indent) {
          if (!inner.render) {
            throw new Error(ERR_PREFIX + "found unexpected block with no render");
          }
          choice.choice.push(inner.render);
          i++;
          inner = blocks[i];
        }
        body.push(choice);
      } else {
        i++;
      }
    }

    blocks[0].render = this.renderer.toRoleplay(attribs, body);
  };

  private toQuest(blocks: Block[], msg: BlockMsgHandler) {
    var title = blocks[0].lines[0].substr(1);
    if (!title) {
      msg.err('missing required quest title', '404');
      title = "UNKNOWN";
    }

    var attribs: {[k: string]: string} = {};
    for(var i = 1; i < blocks[0].lines.length && blocks[0].lines[i] !== ''; i++) {
      var kv = blocks[0].lines[i].split(":");
      if (kv.length !== 2) {
        msg.err('invalid quest attribute string "' + blocks[0].lines[i] + '"',
          '404', blocks[0].startLine + i);
        continue;
      }

      var k = kv[0].toLowerCase();
      var v = kv[1].trim();

      if (!questAttrValidators[k]) {
        msg.err('unknown quest attribute "' + k + '"', '404', blocks[0].startLine + i);
        continue;
      }

      if (!questAttrValidators[k](v)) {
        msg.err('invalid value "' + v + '" for quest attribute "' + k + '"', '404');
        v = '0';
      }

      attribs[k] = v;
    }

    var missingAttribs: string[] = [];
    for (var i = 0; i < requiredQuestAttrs.length; i++) {
      if (!attribs[requiredQuestAttrs[i]]) {
        msg.err('missing required quest attribute "'+requiredQuestAttrs[i]+'"', '404');
        attribs[requiredQuestAttrs[i]] = '0';
      }
    }

    blocks[0].render = this.renderer.toQuest(title, attribs);
    // TODO: Disallow multiple blocks in quest root
    if (blocks.length !== 1) {
      msg.err(
        'quest block group cannot contain multiple blocks',
        '404'
      );
    }
  }

  private toTrigger(blocks: Block[], msg: BlockMsgHandler) {
    var text = blocks[0].lines[0].match(REGEXP_BOLD);
    if (text) {
      blocks[0].render = this.renderer.toTrigger(text[1]);
    } else {
      msg.err(
        'could not parse trigger value from trigger',
        '404',
        blocks[0].startLine
      );
    }

    if (blocks.length !== 1) {
      msg.err(
        'trigger block group cannot contain multiple blocks',
        '404'
      );
    }
  }

  private toCombat(blocks: Block[], msg: BlockMsgHandler) {
    try {
      var data = this.extractJSON(blocks[0].lines[0]);
    } catch (e) {
      msg.err("could not parse block details", "404", blocks[0].startLine);
      data = {};
    }

    if (!data.enemies) {
      msg.err(
        "combat block has no enemies listed",
        "404",
        blocks[0].startLine
      );
      data.enemies = ["UNKNOWN"];
    }
    blocks[0].lines.shift();

    var events: any = {};
    var currEvent: string = null;
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      if (block.render) {
        if (!currEvent) {
          msg.err(
            "found inner block of combat block without an event bullet",
            "404",
            block.startLine
          );
          continue;
        }
        if (!events[currEvent]) {
          events[currEvent] = [];
        }
        events[currEvent].push(block.render);
        continue;
      }

      for (var j = 0; j < block.lines.length; j++) {
        var line = block.lines[j];
        if (line === '') {
          continue;
        }

        // We should only ever see event blocks within the combat block.
        // These blocks are only single lines.
        var m = line.match(REGEXP_EVENT);
        if (!m) {
          // TODO: Return error here
          msg.err(
            "lines within combat block must be event bullets; instead found \""+line+"\"",
            "404",
            block.startLine + j
          );
          continue;
        }
        currEvent = m[1];
      }
    }

    if (!events['win']) {
      msg.err(
        "combat block must have 'win' event",
        "404"
      );
      events['win'] = [this.renderer.toTrigger("end")];
    }
    if (!events['lose']) {
      msg.err(
        "combat block must have 'lose' event",
        "404"
      );
      events['lose'] = [this.renderer.toTrigger("end")];
    }

    blocks[0].render = this.renderer.toCombat(data.enemies, events);
  }

  _finalize(zeroIndentGroups: number[][]): BlockMsg[] {
    var toRender: any[] = [];
    var msg = new BlockMsgHandler([]);

    // Append the first blocks in each group to the render list.
    for (var i = 1; i < zeroIndentGroups.length; i++) {
      toRender.push(this.blockList.at(zeroIndentGroups[i][0]).render);
    }

    var quest: any = null;
    if (this.blockList && this.blockList.length > 0) {
      var questBlock = this.blockList.at(0);
      if (questBlock.lines.length && questBlock.lines[0].length && questBlock.lines[0][0] === '#') {
        quest = questBlock.render;
      } else {
        // Error here. We can still handle null quests in the renderer.
        msg.err("root block must be a quest header", "404", 0);
        quest = this.renderer.toQuest('Error', {});
      }
    } else {
      msg.err("No quest blocks found", "404");
      quest = this.renderer.toQuest('Error', {});
    }

    if (toRender.length === 0) {
      toRender.push(this.renderer.toRoleplay({}, []));
    }

    this.result = this.renderer.finalize(quest, toRender);
    return msg.finalize();
  }

  private extractJSON(line: string): any {
    var m = line.match(/(\{.*\})/);
    if (!m) {
      return {};
    }
    return JSON.parse(m[0]);
  }
  private collate(lines: string[]): string[] {
    var result: string[] = [''];
    for (var i = 0; i < lines.length; i++) {
      if (lines[i] === '') {
        continue;
      }
      if (lines[i-1] === '' && result[result.length-1] !== '') {
        result.push('');
      }
      result[result.length-1] += (result[result.length-1] !== '') ? ' ' + lines[i] : lines[i];
    }
    return result;
  }
}