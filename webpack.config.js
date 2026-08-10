const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Base config that applies to either development or production mode.
const config = {
  entry: {
    main: './src/pages/home/index.js',
    drawing: './src/pages/drawing/index.js',
  },
  output: {
    // Compile the source files into a bundle.
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  // Enable webpack-dev-server to get hot refresh of the app.
  devServer: {
    static: './build',
  },
  module: {
    rules: [
      {
        // Load CSS files. They can be imported into JS files.
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    // Generate the levels home page.
    new HtmlWebpackPlugin({
      template: 'src/pages/home/index.html',
      filename: 'index.html',
      chunks: ['runtime', 'main'],
    }),
    // Generate the drawing workspace page.
    new HtmlWebpackPlugin({
      template: 'src/pages/drawing/index.html',
      filename: 'drawing.html',
      chunks: ['runtime', 'drawing'],
    }),
  ],
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    // Set the output path to the `build` directory
    // so we don't clobber production builds.
    config.output.path = path.resolve(__dirname, 'build');

    // Generate source maps for our code for easier debugging.
    // Not suitable for production builds. If you want source maps in
    // production, choose a different one from https://webpack.js.org/configuration/devtool
    config.devtool = 'eval-cheap-module-source-map';

    // Include the source maps for Blockly for easier debugging Blockly code.
    config.module.rules.push({
      test: /(blockly\/.*\.js)$/,
      use: [require.resolve('source-map-loader')],
      enforce: 'pre',
    });

    // Ignore spurious warnings from source-map-loader
    // It can't find source maps for some Closure modules and that is expected
    config.ignoreWarnings = [/Failed to parse source map/];
  }

  if (argv.mode === 'production') {
    // Split code for better browser caching and smaller initial bootstrap.
    config.output.filename = '[name].[contenthash].js';
    config.optimization = {
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: 'single',
    };

    // Blockly and p5 are large by design, so use realistic warning budgets.
    config.performance = {
      hints: 'warning',
      maxAssetSize: 2 * 1024 * 1024,
      maxEntrypointSize: 2 * 1024 * 1024,
    };
  }
  return config;
};
