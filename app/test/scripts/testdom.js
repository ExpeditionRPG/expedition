
var isVisible = function(e) {
	var style = getComputedStyle(e);
	return style.display !== 'none'
	    && style.visibility !== 'hidden'
	    && style.opacity !== 0
	    && (e.offsetWidth !== 0 || e.offsetHeight !== 0);
};

var hasScrollbar = function(e) {
	return e.attributes.scrollHeight > e.clientHeight;
}

var hasInnerText = function(elems, val) {
    for (var i = 0; i < elems.length; i++) {
        if (elems[i].innerHTML.indexOf(val) !== -1) {
            return true;
        }
    }
    return false;
}
