var markdown = require("markdown").markdown;
var cheerio = require('cheerio');
var fs = require('fs');
var prettifyHTML = require("html").prettyPrint;

var output_file = "output.xml";
var input_file = "simple_roleplay_choice.md";
var debug_info = true;

// ---------------- Utilities ----------------
function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function nodesToArray(nodes_object) {
  var nodes = [];
  for(var i = 0; i < nodes_object.length; i++) {
    nodes.push(nodes_object[i]);
  }
  return nodes;
}

function prettyNodeList(nodes) {
  var result = []
  for(var i = 0; i < nodes.length; i++) {
    result.push(nodes[i].tagName);
  }

  return result;
}

function logAt(context, text) {
  if (!debug_info) {
    return;
  }

  var prefix = "";
  for(var i = 0; i < context.depth; i++) {
    prefix += "  ";
  }
  console.log(prefix + text);
}

// ---------------- Element conversion functions ---------------

function transmuteToQuest(title_node, subtitle_node) {
  var title = title_node.text();
  var meta = subtitle_node.text();

  return cheerio.load('<quest title="'+title+'"></quest>');
};

function transmuteToRoleplay(node, context) {
  if (node) {
    var title = getHeader(node);
    if (title) {
      context.title = title;
    }
  }
  var elem = cheerio.load('<roleplay title="'+context.title+'"></roleplay>')
  logAt(context, elem.html());
  return elem("roleplay");
}

function transmuteToCombat(node, context) {
  var elem = cheerio.load('<combat></combat>');
  var combat = elem("combat");

  var annotation = JSON.parse(getHeaderAnnotation(node));
  for (var i = 0; i < annotation.length; i++) {
    combat.append("<e>" + annotation[i] + "</e>");
  }
  logAt(context, elem.html());
  return combat;
}

function transmuteToChoice(node, context) {
  // <li><p>data</p></li>
  // li -> p -> textnode -> data
  var text = node.children[0].children[0].data;
  var elem = cheerio.load('<choice text="'+text+'"></choice>')
  logAt(context, elem.html());
  return elem("choice");
}

function transmuteToEvent(node, context) {
  // <li><p>data</p></li>
  // li -> p -> textnode -> data
  var condition = node.children[0].children[0].data.split(" ")[1];
  var elem = cheerio.load('<event on="'+condition+'"></event>')
  logAt(context, elem.html());
  return elem("event");
}

function transmuteToInstruction(node) {
  // TODO
}

function transmuteToOperation(node) {
  // TODO
}

function transmuteToComment(node) {
  // TODO
}

function transmuteToTrigger(node, context) {
  var action = node.children[0].children[0].data;
  var elem = cheerio.load('<trigger>'+action+'</trigger>');
  logAt(context, elem.html());
  return elem("trigger");
}

// ------------------ HTML Traversal Functions -----------------

function getHeader(node) {
  if (node.tagName == "p" && node.children && node.children[0].tagName === "em") {
    return node.children[0].children[0].data.trim();
  };
}

function getTrigger(node) {
  if (node.tagName == "p" && node.children && node.children[0].tagName === "strong") {
    return node.children[0].children[0].data.trim();
  };
}

function getHeaderAnnotation(node) {
  if (getHeader(node) && node.children[1] && node.children[1].data) {
    return node.children[1].data.trim();
  };
}

function getNextCluster(nodes) {
  // Consumes a single node, unless roleplay without a header.
  if (nodes.length === 0) {
    return null
  }
  return nodes[0];
}

function getClusterOf(nodes, node, context) {
  if (!node) {
    return [];
  }

  var tag = node.tagName;
  var result = {num_outer: 0, nodes: []};

  if (tag === 'li') {
    // If choice or event, get the stuff directly inside the LI node (minus the first title part)
    result.nodes = node.children.slice(1);
    return result;
  }

  if (tag === 'p') {
    if (!getHeader(node)) {
      // Only accumulate new non-flavortext elements.
      if (context.parentType === "roleplay") {
        logAt(context, "Skipping");
        return result;
      }

      // If we see a <p> not enclosed in a roleplay,
      // that means we "spent" a node to create the <roleplay> tag.
      // Re-add that spent node back into the inner elements of the roleplay tag.
      result.nodes.push(node);
    }

    // If roleplay, look at content past roleplay until next header.
    for (var i = (node) ? 1 : 0; i < nodes.length; i++) {
      if (getHeader(nodes[i])) {
        break;
      }
      result.nodes.push(nodes[i]);
      result.num_outer++;
    }
    return result;
  }
}

function traverse(nodes_object, context) {
  var results = [];
  context.depth++;
  var nodes = nodesToArray(nodes_object);
  while (nodes.length) {
    var result = null;
    var node = nodes[0];

    // Roleplay elements may not have a specific element to consume
    // to create the actual element itself.
    switch(node.tagName) {
      case "p":
        var header = getHeader(node);
        if (header === 'combat') {
          result = transmuteToCombat(node, context);
        } else if (getTrigger(node)) {
          result = transmuteToTrigger(node, context);
        } else if (header || context.parentType !== "roleplay") {
          result = transmuteToRoleplay(node, context);
        } else {
          result = node;
          logAt(context, "<p></p>");
        }
        break;
      case "ul":
        // Prepend UL children to list of nodes to transmute and restart
        // TODO: Probably need to copy something or something here. <========================
        var orig_nodes_string = JSON.stringify(prettyNodeList(nodes));
        nodes = nodes.slice(1);
        nodes = nodesToArray(node.children).concat(nodes);
        logAt(context, "Unwrapping UL: " + orig_nodes_string + " -> " + JSON.stringify(prettyNodeList(nodes)));
        continue;
      case "li":
        // <li><p>data</p></li>
        // li -> p -> textnode -> data
        var body = node.children[0].children[0].data;
        if (body.startsWith("on")) {
          result = transmuteToEvent(node, context);
        } else {
          result = transmuteToChoice(node, context);
        }
        break;
      default:
        // Probably just assume roleplay here.
        throw new Error("Unexpected tag name " + node.tagName);
    }

    var cluster = getClusterOf(nodes, node, context);
    if (cluster.nodes.length > 0) {
      // Ensure we don't affect other contexts.
      var child_context = copy(context);
      child_context.parentType = result[0].tagName;
      var inner_cluster_results = traverse(cluster.nodes, child_context);
      for (var i = 0; i < inner_cluster_results.length; i++) {
        result.append(inner_cluster_results[i]);
      }
    }

    var nodes_used = 1 + cluster.num_outer;
    logAt(context, JSON.stringify(prettyNodeList(nodes)) + ".pop("+nodes_used+") (node " + node.tagName + " cluster " + JSON.stringify(prettyNodeList(cluster.nodes)) + " num_outer " + cluster.num_outer+ ")");
    nodes = nodes.slice(nodes_used);
    results.push(result);
  }
  return results;
}

// ---------------------- File loading -----------------

fs.readFile(input_file, 'utf8', function(err, data) {
  if (err) {
    return console.log(err);
  }
  var rawhtml = markdown.toHTML(data);
  var $ = cheerio.load("<quest>" + rawhtml + "</quest>");

  var result = transmuteToQuest($("quest").children().eq(0), $("quest").children().eq(1));
  var results = traverse($("quest > :not(:nth-child(1)):not(:nth-child(2))"), {title: null, depth: -1, parentType: null});
  var quest = result("quest");
  for (var i = 0; i < results.length; i++) {
    quest.append(results[i]);
  }
  var pretty_html = prettifyHTML(result.html(), {indent_size: 2});

  console.log("=========== RESULT: =============");
  console.log(pretty_html);
  console.log("=================================");

  fs.writeFile(output_file, pretty_html, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("Saved successfully to " + output_file);
  });
});

