var transmute = require('./transmute');
var helpers = require('./helpers');

// TODO: Clean up this bletcherous mess
var copy = helpers.copy;
var nodesToArray = helpers.nodesToArray;
var prettyNodeList = helpers.prettyNodeList;
var getHeader = helpers.getHeader;
var getTrigger = helpers.getTrigger;
var getInstruction = helpers.getInstruction;

var logAt = helpers.logAt;

// ------------------ HTML Traversal Functions -----------------

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
    // Triggers have no child nodes.
    if (getTrigger(node)) {
      return result;
    }

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

    // If roleplay, look at content past roleplay until next header or a trigger.
    for (var i = (node) ? 1 : 0; i < nodes.length; i++) {
      if (getHeader(nodes[i]) || getTrigger(nodes[i])) {
        break;
      }
      result.nodes.push(nodes[i]);
      result.num_outer++;
    }
    return result;
  }

  if (tag === 'blockquote') {
    // Blockquotes have only the children of themselves.
    result.nodes = node.children;
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
          result = transmute.toCombat(node, context);
        } else if (getTrigger(node)) {
          result = transmute.toTrigger(node, context);
        } else if (header || context.parentType !== "roleplay") {
          result = transmute.toRoleplay(node, context);
        } else {
          result = node;
          logAt(context, "<p></p>");
        }
        break;
      case "blockquote":
        result = transmute.toInstruction(node, context);
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
          result = transmute.toEvent(node, context);
        } else {
          result = transmute.toChoice(node, context);
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

exports.traverse = traverse;