const CopyWebpackPlugin = require('copy-webpack-plugin');
const Path = require('path');
const Webpack = require('webpack');
const NodeExternals = require('webpack-node-externals');

const options = require('./webpack.dist.config');

options.plugins.push(new CopyWebpackPlugin([
      { from: 'app/config_base.json' },
    ]));

module.exports = options
