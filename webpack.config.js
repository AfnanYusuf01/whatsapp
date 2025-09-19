import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import webpack from 'webpack';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { SourceMapDevToolPlugin } = webpack;

export default {
  entry: {
    app: path.resolve(__dirname, 'src/src/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'static/'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css'],
  },
  plugins: [
    new SourceMapDevToolPlugin({
      filename: '[file].map',
    }),
    new MiniCssExtractPlugin(),
  ],
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
};
