/// <reference path="../typings/custom/require.d.ts" />
import {Block, BlockError} from './parser'

var cheerio: any = require('cheerio');

const REGEXP_ITALIC = /\_(.*)\_.*/;
const REGEXP_EVENT = /\* on (.*)/;

export function XMLRender(blocks: Block[]): BlockError[] {
  if (!blocks.length) {
    throw new Error("Empty or null block set given");
  }

  // First line of first block is always a header of some kind.
  var headerLine = blocks[0].lines[0];

  if (blocks[0].render) {
    // If zeroth block is rendered, we're rendering the root.
    for (var i = 1; i < blocks.length; i++) {
      blocks[0].render.append(blocks[i].render);
    }
    return [];
  }


  var lines = '';
  for (let b of blocks) {
    lines += ' ' + b.startLine;

    // Explicitly mark each block as 'seen'
    if (b.render === undefined) {
      b.render = null;
    }
  }
  console.log("Rendering block group:" + lines);

  if (headerLine[0] === '#') {
    return toQuest(blocks);
  } else if (headerLine.indexOf('_combat_') === 0) { // Combat card
    return toCombat(blocks);
  } else if (headerLine.indexOf('_end_') === 0) { // End trigger
    return toTrigger(blocks);
  } else { // Roleplay header
    return toRoleplay(blocks);
  }
}

var extractJSON = function(line: string): any {
  var m = line.match(/(\{.*\})/);
  if (!m) {
    return {};
  }
  return JSON.parse(m[0]);
}

var applyAttributes = function(elem: any, line: string): void {
  var parsed = extractJSON(line);
  for (let k of Object.keys(parsed)) {
    elem.attr(k, parsed[k]);
  }
}

var collate = function(lines: string[]): string[] {
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

// Render roleplay lines. If lines ended in a choice,
// returns the created choice element.
var renderRoleplayLines = function(elem: any, lines: string[]): any {
  lines = collate(lines);
  for (let line of lines) {
    if (line.indexOf('* ') === 0) {
      var celem = cheerio.load('<choice>');
      var choice = celem('choice');
      choice.attr('text', line.substr(1).trim());
      elem.append(choice);
      return choice;
    } else {
      elem.append('<p>' + line + '</p>');
    }
  }
  // TODO: Deeper markdown rendering of lines.
  /*
    '/(\*\*|__)(.*?)\1/' => '<strong>\2</strong>',            // bold

    '/(\*|_)(.*?)\1/' => '<em>\2</em>',                       // emphasis

  var i = 0;
  while (i < lines.length) {
    var line = lines[i];
    if (line === '') {
      i++;
      continue;
    }

    var j = i;
    while (lines[j] !== '' && j < lines.length) {
      j++;
    }
    agg = lines.slice(i, i-j).join(' ');

    if (agg.indexOf('* ') === 0 && next) {
        var celem = cheerio.load('<choice>');
        var choice = celem('choice');
        console.log(next);
        choice.append(next.render);
        elem.append(choice);
        usedNext = true;
        continue;
    } else
      elem.append('<p>' + line + '</p>');
    }
    i++;
  }
  */
  return null;
}

var toRoleplay = function(blocks: Block[]): BlockError[] {
  var elem = cheerio.load('<roleplay>');
  var roleplay = elem('roleplay');

  var titleText = blocks[0].lines[0].match(REGEXP_ITALIC);
  if (titleText) {
    roleplay.attr('title', titleText[1]);
    applyAttributes(roleplay, blocks[0].lines[0]);
    blocks[0].lines = blocks[0].lines.splice(1);
  }

  // The only inner stuff
  var i = 0;
  console.log(blocks.length + ' blocks, starting with line ' + blocks[0].startLine);
  while (i < blocks.length) {
    var block = blocks[i];
    if (block.render) {
      // Only the blocks within choices should be rendered at this point.
      throw new Error("Internal XML parser error: found unexpected block with render");
    }

    // Append rendered stuff
    var choice: any = renderRoleplayLines(roleplay, block.lines);
    if (choice) {
      // If we ended in a choice, continue through subsequent blocks until we end
      // up outside the choice node again.
      var inner = blocks[++i];
      while (i < blocks.length && inner.indent !== block.indent) {
        // TODO: Return error if no render
        choice.append(inner.render);
        i++;
        inner = blocks[i];
      }
    } else {
      i++;
    }
  }

  blocks[0].render = roleplay;

  return [];
};

var toCombat = function(blocks: Block[]): BlockError[] {
  var combat = cheerio.load('<combat></combat>')("combat");
  var data = extractJSON(blocks[0].lines[0]);

  if (!data.enemies) {
    // TODO: Return error here
  }

  for (var i = 0; i < data.enemies.length; i++) {
    var e = cheerio.load('<e>'+data.enemies[i]+'</e>');
    combat.append(e('e'));
  }

  blocks[0].lines.shift();

  var currEvent: any = null;
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (block.render) {
      if (!currEvent) {
        // TODO: Return error here
        console.log("Something bad");
      }
      currEvent.append(block.render);
      continue;
    }

    for (var j = 0; j < block.lines.length; j++) {
      var line = block.lines[j];
      if (line === '') {
        continue;
      }

      // We should only ever see event nodes within the combat node.
      // These nodes are only single lines.
      var m = line.match(REGEXP_EVENT);
      if (!m) {
        // TODO: Return error here
        console.log("No match: \""+line+"\"");
        return [];
      }

      currEvent = cheerio.load('<event></event>')('event');
      currEvent.attr('on', m[1]);
      combat.append(currEvent);
      // TODO CRITICAL: Load remaining event nodes here.
      //console.log("TODO LOAD EVENT NODES");

    }
  }


  blocks[0].render = combat;
  console.log("COMABATA");

  /*


  var attribs = parseAttributes(node);

  // Add enemies as <e>, and delete it from attributes
  for (var i = 0; i < attribs.enemies.length; i++) {
    combat.append("<e>" + attribs.enemies[i] + "</e>");
  }
  delete attribs.enemies;

  applyAttributes(combat, attribs, context, ["icon"]);
  format.dbg(context, elem.html());

  var toEvent = function(blocks: Block[]): BlockError[] {
    var data = firstChildText(node).split('{');
    var condition = data[0].split(" ")[1].trim();
    var attribs = (data[1]) ? JSON.parse('{'+data[1]) : {};
    var elem = cheerio.load('<event on="'+condition+'"></event>');
    var event = elem("event");

    applyAttributes(event, attribs);
    format.dbg(context, elem.html());

    traverseAndAppend(event, node.children().slice(1), format.indent(context));
    return {node: event, consumed: 1};
  };

  // Get the event nodes (initially this is a BRANCH_WRAP, so there's only one)
  traverseAndAppend(combat, nodes.eq(1), format.indent(context));
  return {node: combat, consumed: 2};
  */
  return [];
};

var toTrigger = function(blocks: Block[]): BlockError[] {
  var errors: BlockError[] = [];
  var text = blocks[0].lines[0].match(REGEXP_ITALIC);
  if (text) {
    var elem = cheerio.load('<trigger>'+text[1]+'</trigger>');
    blocks[0].render = elem('trigger');
  } else {
    errors.push({
      blockGroup: blocks,
      error: 'Could not parse trigger value from trigger',
      example: '',
    });
  }

  if (blocks.length !== 1) {
    errors.push({
      blockGroup: blocks,
      error: 'Trigger block group cannot contain multiple blocks',
      example: '',
    });
  }

  return errors;
};

var toQuest = function(blocks: Block[]): BlockError[] {
  var errors: BlockError[] = [];
  var elem = cheerio.load('<quest>');
  var quest = elem('quest');
  quest.attr('title', blocks[0].lines[0].substr(1));
  for(var i = 1; i < blocks[0].lines.length && blocks[0].lines[i] !== ''; i++) {
    var kv = blocks[0].lines[i].split(":");
    quest.attr(kv[0].toLowerCase(), kv[1].trim());
  }

  blocks[0].render = quest;
  // TODO: Disallow multiple blocks in quest root
  if (blocks.length !== 1) {
    errors.push({
      blockGroup: blocks,
      error: 'Quest block group cannot contain multiple blocks',
      example: '',
    });
  }

  return errors;
}
