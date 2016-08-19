
// ---------------- Utilities ----------------
exports.debug_info = false;

exports.copy = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

exports.nodesToArray = function(nodes_object) {
  var nodes = [];
  for(var i = 0; i < nodes_object.length; i++) {
    nodes.push(nodes_object[i]);
  }
  return nodes;
};

exports.prettyNodeList = function(nodes) {
  var result = []
  for(var i = 0; i < nodes.length; i++) {
    result.push(nodes[i].tagName);
  }

  return result;
};

exports.logAt = function(context, text) {
  if (!exports.debug_info) {
    return;
  }

  var prefix = "";
  for(var i = 0; i < context.depth; i++) {
    prefix += "  ";
  }
  console.log(prefix + text);
};

// TODO: Rename this and getTrigger to parse*
exports.getHeader = function(node) {
  if (node.tagName === "p" && node.children && node.children[0].tagName === "em") {
    return node.children[0].children[0].data.trim();
  };
}

exports.getTrigger = function(node) {
  if (node.tagName === "p" && node.children && node.children[0].tagName === "strong") {
    return node.children[0].children[0].data.trim();
  };
}

exports.getInstruction = function(node) {
  // <blockquote><p>data</p></blockquote>
  if (node.tagName === "blockquote" && node.children) {
    return node.children[0].children[0].data.trim();
  }
}

exports.parseAttributes = function(node) {
  if (exports.getHeader(node) && node.children[1] && node.children[1].data) {
    return JSON.parse(node.children[1].data);
  };
}