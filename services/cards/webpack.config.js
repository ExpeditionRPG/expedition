const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const shared = require('../../shared/webpack.shared');

const options = {
  entry: {
    bundle: ['./src/React.tsx', './src/styles/index.scss'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          context: '../../shared/images',
          from: '**/*.+(jpg|svg|png)',
          to: './images',
        },
      ],
    }),
  ],
};

module.exports = merge(shared, options);
