var cheerio = require('cheerio');
var format = require('./format');

function isControlNode(node) {
  return node.is('choice') || node.is('event') || node.attr('on');
}

function edgeToNextNode(node, global_context) {
  while (true) {
    var sibling = node.next();

    if (sibling.length !== 0 && !isControlNode(sibling)) {
      return {"next": traverse(sibling, global_context)[0]};
    }

    if (node.is('quest')) {
      break;
    }
    if (sibling !== null && sibling.length !== 0) {
      node = sibling;
    } else {
      node = node.parent();
    }
  }
}

function eventEdges(node, global_context) {
  var results = {};
  var events = node.children('event');
  for(var i = 0; i < events.length; i++) {
    var event = events.eq(i);
    if (event.children().length) {
      results[event.attr('on')] = traverse(event.children().eq(0), global_context)[0];
    } else {
      results[event.attr('on')] = event.attr('goto');
    }
  }

  if (results === {}) {
    return edgeToNextNode(node, global_context);
  }

  return results;
}

function choiceEdges(node, global_context) {
  var results = {};
  var choices = node.children('choice');
  for (var i = 0; i < choices.length; i++) {
    var choice = choices.eq(i);
    if (choice.children().length) {
      results[choice.attr('text')] = traverse(choice.children().eq(0), global_context)[0];
    } else {
      results[choice.attr('text')] = choice.eq(0).attr('goto');
    }
  }

  if (!Object.keys(results).length) {
    return edgeToNextNode(node, global_context);
  }
  return results;
}

function roleplayNode(node, global_context) {
  var idx = global_context.idx++;
  var result = {
    'idx': idx,
    'type': 'roleplay',
    'title': node.attr('title'),
    'id': node.attr('id'),
    'icon': node.attr('icon')
  };

  global_context.nodes[idx] = result;
  global_context.nodes[idx].out = choiceEdges(node, global_context);

  return idx;
}

function combatNode(node, global_context) {
  var idx = global_context.idx++;
  var result = {
    'idx': idx,
    'type': 'combat',
    'icon': node.attr('icon'),
    'id': node.attr('id'),
    'enemies': []
  };
  var enemies = node.children('e');
  for(var i = 0; i < enemies.length; i++) {
    result.enemies.push(enemies.eq(i).text());
  }

  global_context.nodes[idx] = result;
  global_context.nodes[idx].out = eventEdges(node, global_context);

  return idx;
}

function triggerNode(node, global_context) {
  var idx = global_context.idx++;
  var result = {
    'idx': idx,
    'type': 'trigger',
    'text': node.text()
  }

  global_context.nodes[idx] = result;

  // 'Out' on a trigger should always be empty.
  global_context.nodes[idx].out = {};
  return idx;
}

function questNode(node, global_context) {
  var idx = global_context.idx++;
  // Parse headers
  result = {
    'idx': idx,
    'type': 'quest'
  };
  var attrs = [
    "title",
    "summary",
    "author",
    "email",
    "url",
    "recommended-min-players",
    "recommended-max-players",
    "min-time-minutes",
    "max-time-minutes"
  ];
  for (var i = 0; i < attrs.length; i++) {
    result[attrs[i]] = node.attr(attrs[i]);
  }

  global_context.nodes[idx] = result;
  global_context.nodes[idx].out = {"start": traverse(node.children().eq(0), global_context)[0]};

  return idx;
}

function uniquePath(node) {
  var ptr = node;
  var path = "";
  while(ptr.get()[0].tagName !== 'quest') {
    path = ptr.get()[0].tagName + ptr.parent().children().index(ptr) + "/" + path;
    ptr = ptr.parent();
  }
  return path;
}

function setCached(node, global_context, value) {
  var path = uniquePath(node);
  global_context.cache[path] = value;
}

function lookupCached(node, global_context) {
  var path = uniquePath(node);
  return global_context.cache[path];
}

function traverse(nodes, global_context) {
  var options = {
    "roleplay": roleplayNode,
    "combat": combatNode,
    "trigger": triggerNode,
  };

  var results = [];
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes.eq(i);

    // If already seen, return the seen node's ID.
    var cached = lookupCached(node, global_context);
    if (cached !== undefined) {
      results.push(cached);
      continue;
    }

    try {
      setCached(node, global_context);
      var name = node.prop('tagName').toLowerCase();
      var val = options[name](node.eq(i), global_context);
      results.push(val);
      setCached(node, global_context, val);
    } catch (e) {
      console.log("Failed to parse node: " + node.prop('tagName'));
      throw e;
    }
  }
  return results;
}

function resolveIDs(global_context) {
  // Build a map of ID to nid so we can translate.
  // Also setup incoming edge list.
  var idToNid = {};
  for (var i = 0; i < global_context.nodes.length; i++) {
    var node = global_context.nodes[i];
    if (node.id !== undefined) {
      idToNid[node.id] = node.idx;
    }

    node.in = [];
  }

  // Resolve string IDs in out edges to integer Nids
  for (var i = 0; i < global_context.nodes.length; i++) {
    var node = global_context.nodes[i];
    var outkeys = Object.keys(node.out);

    for (var j = 0; j < outkeys.length; j++) {
      var dest = node.out[outkeys[j]];
      if (typeof dest === 'string') {
        dest = idToNid[dest];
      }
      node.out[outkeys[j]] = dest;

      // Specify inputs to the output nodes as well
      global_context.nodes[dest].in.push(node.idx);
    }
  }
}

// TODO: Potentially an additional "walkthrough" mode that shows
// all possible playthroughs.

function isRunRoot(node, nodeMap) {
  if (node.in.length !== 1) {
    return true;
  }

  var previdx = node.in[0];
  if (Object.keys(nodeMap[previdx].out).length !== 1) {
    return true;
  }

  return false;
}

function buildRuns(nodes, nodeMap) {

  // Roots are nodes with zero or >1 incoming edges.
  var roots = [nodeMap[0].idx];
  for (var i = 1; i < nodes.length; i++) {
    var node = nodeMap[i];

    if (!isRunRoot(node, nodeMap)) {
      continue;
    }
    // Edge case: double output leads to double input.
    // 1 -> 2 -> 3
    // |-...  ---^
    /*
    var outkeys = Object.keys(node.out);
    if (outkeys.length === 1 && node.in.length === 1) {
      if (Object.keys(nodeMap[node.in[0]].out) !== 1) {

      }
    }
    */

    roots.push(node.idx);
  }
  roots = roots.sort(function(a,b) {return a-b;});
  //console.log(roots);

  // Loop through roots to get endpoints and outputs
  var runs = {};
  for (var i = 0; i < roots.length; i++) {
    var seen = roots.slice();
    seen.splice(seen.indexOf(roots[i]), 1);
    var node = nodeMap[roots[i]];
    var inIdxs = node.in;

    var run = [];
    while(seen.indexOf(node.idx) === -1) {
      run.push(node.idx);
      seen.push(node.idx);
      //console.log(node);
      var nextidx = node.out[Object.keys(node.out)[0]];
      var nextnode = nodeMap[nextidx];
      if (!nextnode || isRunRoot(nextnode, nodeMap)) {
        break;
      }
      node = nextnode;
    }

    var outIdxs = []
    var outkeys = Object.keys(node.out);

    for (var j = 0; j < outkeys.length; j++) {
      outIdxs.push(node.out[outkeys[j]]);
    }

    runs[roots[i]] = {in: inIdxs, run: run, out: outIdxs};
  }
  //console.log(runs);
  return runs;
}

function linkify(global_context) {
  // TODO: This is gross, but it works alright. Fix this up some time.
  // var exampleGraph = {
  //  "nodes":[
  //    {"nid":1,"type":"WebGLRenderer","x":1479,"y":351,"fields":{"in":[{"name":"width"},{"name":"height"},{"name":"scene"},{"name":"camera"},{"name":"bg_color"},{"name":"postfx"},{"name":"shadowCameraNear"},{"name":"shadowCameraFar"},{"name":"shadowMapWidth"},{"name":"shadowMapHeight"},{"name":"shadowMapEnabled"},{"name":"shadowMapSoft"}],"out":[]}},
  //    {"nid":14,"type":"Camera","x":549,"y":478,"fields":{"in":[{"name":"fov"},{"name":"aspect"},{"name":"near"},{"name":"far"},{"name":"position"},{"name":"target"},{"name":"useTarget"}],"out":[{"name":"out"}]}},
  //    {"nid":23,"type":"Scene","x":1216,"y":217,"fields":{"in":[{"name":"children"},{"name":"position"},{"name":"rotation"},{"name":"scale"},{"name":"doubleSided"},{"name":"visible"},{"name":"castShadow"},{"name":"receiveShadow"}],"out":[{"name":"out"}]}},
  //  ],
  // "connections":[
  //    {"from_node":23,"from":"out","to_node":1,"to":"scene"},
  //    {"from_node":14,"from":"out","to_node":1,"to":"camera"}
  //  ]
  //};
  var graph = {nodes: [], connections: []};


  var nodeMap = {};
  for (var i = 0; i < global_context.nodes.length; i++) {
    nodeMap[global_context.nodes[i].idx] = global_context.nodes[i];
  }

  // Construct a list of starting nodes that appear on the far left of the graph.
  // Such nodes have at least one sibling, or are a quest node.
  var runs = buildRuns(global_context.nodes, nodeMap);

  var buckets = [];
  var stage = [0];
  var seen = [];
  var maxBucketSize = 0;
  while (stage.length > 0) {
    // Run until stage is done
    var stack = [];
    var resolved = [];
    for(var i = 0; i < stage.length; i++) {

      if (seen.indexOf(stage[i]) !== -1) {
        continue;
      }
      seen.push(stage[i]);
      var run = runs[stage[i]];
      resolved.push(runs[stage[i]].run);

      Array.prototype.push.apply(stack,run.out);
    }

    buckets.push(resolved);
    maxBucketSize = Math.max(maxBucketSize, resolved.length);
    stage = stack;
  }

  //console.log(JSON.stringify(buckets));
  var offsetX = 100;
  var offsetY = 100;
  var spacing = 200;
  var x_base = 0;
  for (var i = 0; i < buckets.length; i++) {
    var dy = maxBucketSize / (buckets[i].length+1);

    var maxRunLength = 0;
    for (var j = 0; j < buckets[i].length; j++) {
      maxRunLength = Math.max(maxRunLength, buckets[i][j].length);

      var y = j*spacing;
      var dx = maxRunLength / (buckets[i][j].length + 1);

      for (var k = 0; k < buckets[i][j].length; k++) {
        var x = k*spacing+x_base;

        var node = nodeMap[buckets[i][j][k]];
        var type = node.type;
        if (node.title) {
          type = node.title.substr(0, 16);
        }

        var edges = [];
        var outkeys = Object.keys(node.out);
        for (var e = 0; e < outkeys.length; e++) {
          var name = outkeys[e].substr(0, 8);
          edges.push({"name": name});
          graph.connections.push({
            "from_node": node.idx,
            "from": name,
            "to_node": node.out[outkeys[e]],
            "to": "in"
          });
        }


        var graphnode = {
          "nid": node.idx,
          "type": node.idx + ": " + type,
          "x": x + offsetX,
          "y": y + offsetY,
          "fields": {
            "in": [{"name": "in"}],
            "out": edges
          }
        };
        graph.nodes.push(graphnode);
        //console.log(node.idx + " @ (" + x + ", " + y+")");
      }
    }

    x_base += (maxRunLength+1)*spacing;
  }
  return graph;
}

function convertQuestXMLToGraphJSON(text, verbose) {
  format.debug_info = verbose;
  var $ = cheerio.load(text);
  var global_context = {idx: 0, nodes: [], cache: {}};
  questNode($("quest"), global_context);
  resolveIDs(global_context);
  return JSON.stringify(linkify(global_context));
}

module.exports = convertQuestXMLToGraphJSON;