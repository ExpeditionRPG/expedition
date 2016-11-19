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

  constructor(md: string) {
    this.parse(md);
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

  // Construct a list of blocks, given an entire QDL document as a string.
  private parse(md: string) {

    // Replace tabs with spaces (just in case)
    md = md.replace(/\t/g, '  ');
    this.blocks = [];

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
        this.blocks.push(currBlock);
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
    this.blocks.push(currBlock);

    // Compute index array
    this.length = this.blocks.length;
  }
}