
// Returns a random integer from 0 (inclusive) to n (exclusive)
var randInt = function(n) {
	return Math.floor(Math.random() * n);
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
var shuffleArray = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = randInt(i+1);
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

// Choose an element from an array with uniform probability
var choose = function(array, n) {
	// If n isn't specified, just return a random element from the array.
	if (n == undefined) {
		return array[randInt(array.length)];
	}

	// Create a random permutation of indices
	var idxs = [];
	for (var i = 0; i < array.length; i++) {
		idxs.push(i);
	}
	shuffleArray(idxs);

	// Choose the first n
	var result = [];
	for (var i = 0; i < n; i++) {
		result.push(array[idxs[i]]);
	}
	return result;
};

function rnd() {
    return Math.random();
}

function rnd_xy_rotation(unit_vector) {
    // Random angle between PI/8 and -PI/8
    var random_angle = (rnd() * Math.PI / 4) - Math.PI / 4 / 2;

    // Rotate the vector by the random angle in the XY plane.
    var vec = {
        x: unit_vector.x * Math.cos(random_angle) - unit_vector.y * Math.sin(random_angle),
        y: unit_vector.x * Math.sin(random_angle) + unit_vector.y * Math.cos(random_angle)
    };
    return vec;
}
