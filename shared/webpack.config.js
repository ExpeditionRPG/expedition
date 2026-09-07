const { merge } = require('webpack-merge');
const shared = require('./webpack.shared');

const options = {
  // Nice and simple!
};

module.exports = merge(shared, options);
