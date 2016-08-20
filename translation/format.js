
// ---------------- Utilities ----------------
debug_info = false;

var formatAt = function(context, text) {
  var prefix = "";
  for(var i = 0; i < context.depth; i++) {
    prefix += "    "; // 4-space tabs for markdown
  }
  return prefix + text + '\n';
}

var debugAt = function(context, text) {
  if (debug_info) {
    var fmt = formatAt(context, text);
    console.log(fmt.substr(0,fmt.length-1));
  }
};

var indent = function(context) {
  var deeper = JSON.parse(JSON.stringify(context));
  deeper.depth++;
  return deeper;
}

module.exports = {
  at: formatAt,
  dbg: debugAt,
  indent: indent,
};