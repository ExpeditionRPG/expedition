import {BlockList} from './BlockList'

const expect: any = require('expect');

describe('BlockList', () => {
  it('parses empty string', () => {
    const list = new BlockList('');
    expect(list.length).toBe(0);
  });

  it('parses single block', () => {
    const list = new BlockList('This is a block');
    expect(list.length).toBe(1);
    expect(list.at(0)).toEqual({
      indent: 0,
      lines: ['This is a block'],
      startLine: 0,
    });
  });

  it('parses multiple inline blocks', () => {
    const list = new BlockList('_Block 1_\n\ntext\n\n_Block 2_\n\nmore text');
    expect(list.length).toBe(2);
    expect(list.at(0)).toEqual({
      indent: 0,
      lines: ['_Block 1_', '', 'text', ''],
      startLine: 0,
    });
    expect(list.at(1)).toEqual({
      indent: 0,
      lines: ['_Block 2_', '', 'more text'],
      startLine: 4,
    });
  });

  it('treats triggers as new blocks', () => {
    const list = new BlockList('_Block 1_\n\ntext\n\n**end**');
    expect(list.at(0)).toEqual({
      indent: 0,
      lines: ['_Block 1_', '', 'text', ''],
      startLine: 0,
    });
    expect(list.at(1)).toEqual({
      indent: 0,
      lines: ['**end**'],
      startLine: 4,
    });
  })

  it('parses new block on indent', () => {
    const list = new BlockList('* choice\n\n  Choice text');
    expect(list.at(0)).toEqual({
      indent: 0,
      lines: ['* choice', ''],
      startLine: 0,
    });
    expect(list.at(1)).toEqual({
      indent: 2,
      lines: ['Choice text'],
      startLine: 2,
    });
  });

  it('parses new block on dedent', () => {
    const list = new BlockList('    First block\n\n  Second block');
    expect(list.at(0)).toEqual({
      indent: 4,
      lines: ['First block', ''],
      startLine: 0,
    });
    expect(list.at(1)).toEqual({
      indent: 2,
      lines: ['Second block'],
      startLine: 2,
    });
  });

  it('strips pre-text newlines', () => {
    const list = new BlockList('\n\n\n\n  Block');
    expect(list.at(0)).toEqual({
      indent: 2,
      lines: ['Block'],
      startLine: 4,
    });
  });

  it('parses tabs', () => {
    const list = new BlockList('\tFirst block');
    expect(list.at(0)).toEqual({
      indent: 2,
      lines: ['First block'],
      startLine: 0,
    });
  });

  it('parses same block if no separating empty line', () => {
    const list = new BlockList('* a choice that takes\n  multiple lines and has indent!');
    expect(list.at(0)).toEqual({
      indent: 0,
      lines: ['* a choice that takes', 'multiple lines and has indent!'],
      startLine: 0,
    });
  });
});
