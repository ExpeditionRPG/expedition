// Terms:
// - Indent level: The number of preceding spaces to a given line.
// - Position: The number of blocks between this block and the start of the file.
//
// Goals:
// - Snapping user cursor to position when choice clicked
// - Showing errors in Ace gutter
// - Updating preview body in real time

// A block is a section of text, an indentation count, and its starting line.
// Block text is shifted so that there is no preceding whitespace on any line.
export interface Block {
  lines: string[];
  indent: number;
  startLine: number;
  group?: number;

  // When we generate XML or any other rendered output, we cache it here.
  render?: any;
}

export interface BlockError {
  blockGroup: Block[];
  error: string;
  example: string;
}

declare type BlockMap = {[line:string]: Block};
declare type Renderer = (blocks: Block[]) => BlockError[];

// LiveParser is a stateful QDL parsing utility that handles incremental changes in
// quest code, compiling only as needed and allowing for real-time updates in the
// companion app.
export  class LiveParser {
  private liveDom: any;
  private liveLine: number;

  private blockMap: BlockMap;
  private blockLines: string[];

  public valid: boolean;
  private renderer: Renderer;
  private result: any;

  constructor(renderer: Renderer) {
    this.blockMap = {};
    this.blockLines = [];
    this.renderer = renderer;
    this.valid = true;
    this.liveDom = null;
    this.result = null;
  }

  // While registered, LP will mutate the dom element and render
  // updates made to the block containing the line number.
  // Only one DOM can be registered at a time as only one card
  // will be visible anyways.
  registerLiveDOM(dom: any, lineNumber: number) {
    this.liveDom = dom;
    this.liveLine = lineNumber;
  }

  // Returns a rendered version of the current markdown document.
  // This is failure-tolerant: any blocks that fail to compile
  // are shown as "error card" placeholders.
  public getRender(): any {
    // The first block is always the root quest element.
    // Since render is called on update, it should be valid XML always.
    return this.result;
  }

  // Update the parser state, given the entire markdown document.
  // Diffs will be extracted and those specific blocks updated.
  // Any live DOM elements will be updated with the rendered result.
  // Errors occurred during parsing are also returned.
  public update(md: string): BlockError[] {

    // TODO: pre-processing (replace tabs with spaces)

    // TODO: Don't blow away previous work (do per-block updates)
    this.blockMap = {};

    // Split the existing markdown code into individual blocks, separating
    // at differing indentation of code (with some exceptions for markdown-like
    // continuation of bulleted strings)
    // The result is a map of indent level to Block[].
    var split = md.split('\n');
    var accumulated: string[] = [];
    var indent = 0;
    var startLine = 0;
    var prevEmpty = false;
    var currBlock: Block = {
      lines: [],
      indent: 0,
      startLine: 0,
    };
    for (var lineNumber = 0; lineNumber < split.length; lineNumber++) {
      var line = split[lineNumber];
      var indent = 0;
      while(line[indent] === ' ') {
        indent++;
      }

      if (line[indent] === undefined) {
        // Track all-whitespace lines.
        prevEmpty = true;
        currBlock.lines.push('');
        continue;
      }

      // Start a new block on:
      // - String starting with "_" after any whitespace
      // - String with less whitespace than the start of the string
      // - "empty" (or all whitespace) line followed by line with more indent.
      if (line[indent] === '_'
        || indent < currBlock.indent
        || (indent > currBlock.indent && prevEmpty)) {

        // TODO: If we already had a block in the blockgroup that matches this position,
        // compare its string body with the lines matched.
        // If there's a difference, replace the block (without updating XML)
        // Otherwise do nothing.
        this.blockMap[currBlock.startLine] = currBlock;
        currBlock = {
          lines: [],
          indent: indent,
          startLine: lineNumber,
        };
      }

      // Trim *all* whitespace from added strings when adding into blocks.
      currBlock.lines.push(line.trim());
      prevEmpty = false;
    }

    // Add the final block
    this.blockMap[currBlock.startLine] = currBlock;

    // Compute index array
    this.blockLines = Object.keys(this.blockMap).sort(function(a: any, b: any){return a-b;})


    // For debugging
    console.log('#\tLine#\tIndent\tLines');
    for(var i = 0; i < this.blockLines.length; i++) {
      var bm = this.blockLines[i];
      console.log(i + '\t' + bm + '\t' + this.blockMap[bm].indent + '\t' + this.blockMap[bm].lines);
    }

    var errors = this.render();
    this._updateLiveDom();
    return errors;
  }

  _hasHeader(block: Block): boolean {
    return block && block.lines.length && block.lines[0].length && (block.lines[0][0] === '_' || block.lines[0][0] === '#');
  }

  _getBlockGroups(): ({[indent:string]: number[][]}) {
    // Group blocks by indent.
    // Blocks are grouped up to the maximum indent level
    var groups: {[indent:string]: number[][]} = {};
    for (var i = 0; i < this.blockLines.length; i++) {
      var curr = this.blockMap[this.blockLines[i]];

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

  render(): BlockError[] {
    var errors: BlockError[] = [];

    var groups = this._getBlockGroups();
    console.log("Block groups:");
    console.log(groups);

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

        Array.prototype.push.apply(errors, this._renderSegment(indents[i+1], group[0], group[group.length-1]));
      }
    }

    // Do final processing (e.g. putting all values inside of the first block <quest> tag)
    Array.prototype.push.apply(errors, this._finalize(groups[indents[0]]));

    this.result = this.blockMap[this.blockLines[0]].render;
    return errors;
  }

  _renderSegment(nextIndent: string, startBlockIdx: number, endBlockIdx: number) {
    // Precondition: All blocks with indent greater than the starting block
    // have already been rendered and has a .render property set (i.e. not undefined)

    // Base indent is determined by the start block.
    var baseIndent = this.blockMap[this.blockLines[startBlockIdx]].indent;

    // We must check if the block *after* endBlockIdx is nextIndent-ed, because this indicates
    // more blocks must be added to the render list.
    // In this case, we redefine endBlockIdx to be the last nextIndent block before
    // the next baseIndent block.
    var afterBlock = this.blockMap[this.blockLines[endBlockIdx+1]];
    if (afterBlock && ''+afterBlock.indent === nextIndent) {
      do {
        endBlockIdx++;
        afterBlock = this.blockMap[this.blockLines[endBlockIdx+1]];
      } while(afterBlock && afterBlock.indent > baseIndent);
    }

    // Loop through *all* blocks between start and end idx.
    // We need blocks that aren't rendered
    var toRender: Block[] = [];

    for (var i = startBlockIdx; i <= endBlockIdx; i++) {
      var block = this.blockMap[this.blockLines[i]];

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

    return this.renderer(toRender);
    // Postcondition: Every block from startLine to endLine must have a set .render property (anything but 'undefined')
  }

  _finalize(zeroIndentGroups: number[][]) {
    var toRender: Block[] = [];

    // Append the first blocks in each group to the render list.
    for (var i = 0; i < zeroIndentGroups.length; i++) {
      toRender.push(this.blockMap[this.blockLines[zeroIndentGroups[i][0]]]);
    }

    // The renderer finalizes these top-level rendered blocks.
    // This is treated differently than regular calls to renderer() because
    // the first block has a render defined.
    return this.renderer(toRender);
  }

  // Update the registered HTML dom element to reflect
  // the current rendered XML code.
  _updateLiveDom() {
    // TODO use the actual XML rendering code in the app,
    // Unless it begins with a #Quest Title, then display a "Quest Description" card.
    if (!this.liveDom) {
      return;
    }

    throw new Error("TODO");
  }
}