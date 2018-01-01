import {Logger} from '../Logger'

// Terms:
// - Indent level: The number of preceding spaces to a given line.
// - Position: The number of blocks between this block and the start of the file.
//

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

export class BlockList {
  private blocks: Block[];
  public length: number;
  public logger: Logger;

  constructor(md: string, logger: Logger = new Logger()) {
    this.parse(md, logger);
    this.logger = logger;
  }

  debugLines(): string {
    // For debugging
    var result = '#\tLine#\tIndent\tLines';
    for(var i = 0; i < this.blocks.length; i++) {
      result += i + '\t' + this.blocks[i].startLine + '\t' + this.blocks[i].indent + '\t' + this.blocks[i].lines;
    }
    return result;
  }

  at(idx: number): Block {
    return this.blocks[idx];
  }

  private shouldStartNewBlock(currBlock: Block|null, line: string, indent: number, prevEmpty: boolean): boolean {
    // Start a new block if...
    // there is no current block
    if (!currBlock) {
      return true;
    }

    // line with less whitespace than the start of the block
    if (indent < currBlock.indent) {
      return true;
    }

    // start of a combat or roleplay header
    if (line[indent] === '_' && prevEmpty) {
      return true;
    }

    // whitespace line followed by line with more indent.
    // (e.g. going from choice to inner roleplay without header)
    if (indent > currBlock.indent && prevEmpty) {
      return true;
    }

    // start of a trigger
    if (line[indent] === '*' && line[indent+1] === '*') {
      return true;
    }

    // after a trigger and whitespace
    var currBlockStart = currBlock.lines && currBlock.lines[0];
    if (prevEmpty && currBlockStart && currBlockStart[0] === '*' && currBlockStart[1] === '*') {
      return true;
    }

    return false;
  }

  // Construct a list of blocks, given an entire QDL document as a string.
  private parse(md: string, logger: Logger) {

    // Replace tabs with spaces (just in case)
    md = md.replace(/\t/g, '  ');
    // remove all comments before we start parsing
    md = md.replace(/\/\/.*/g, '');
    this.blocks = [];

    // Split the existing markdown code into individual blocks, separating
    // at differing indentation of code (with some exceptions for markdown-like
    // continuation of bulleted strings)
    // The result is a map of indent level to Block[].
    const split = md.split('\n');
    var accumulated: string[] = [];
    var prevEmpty = false;
    var currBlock: Block|null = null;
    for (let lineNumber = 0; lineNumber < split.length; lineNumber++) {
      let line = split[lineNumber];
      let indent = 0;
      while(line[indent] === ' ') {
        indent++;
      }

      if (line[indent] === undefined) {
        // Track all-whitespace lines.
        prevEmpty = true;
        if (currBlock) {
          currBlock.lines.push('');
        }
        continue;
      }

      if (indent % 2 === 1) {
        logger.err('Incorrect indentation: leading spaces must be multiple of two.', '436', lineNumber);
        continue;
      }

      if (this.shouldStartNewBlock(currBlock, line, indent, prevEmpty)) {

        if (currBlock) {
          this.blocks.push(currBlock);
        }

        currBlock = {
          lines: [],
          indent: indent,
          startLine: lineNumber,
        };
      }

      // Trim *all* whitespace from added strings when adding into blocks.
      if (currBlock) {
        currBlock.lines.push(line.trim());
      }
      prevEmpty = false;
    }

    // Add the final block
    if (currBlock) {
      this.blocks.push(currBlock);
    }

    // Compute index array
    this.length = this.blocks.length;
  }
}
