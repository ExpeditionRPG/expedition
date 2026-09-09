const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const shared = require('../../shared/webpack.shared');

const options = {
  entry: {
    bundle: ['./src/React.tsx', './src/Style.scss'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: 'src/assets' }],
    }),
  ],
};

module.exports = merge(shared, options);
