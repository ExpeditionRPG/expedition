const Merge = require('webpack-merge');
const shared = require('./webpack.shared');

const options = {
  // Nice and simple!
};

module.exports = Merge(shared, options);
