module.exports = {
  entry: ['webpack/hot/dev-server', './app.js'],

  output: {
    filename: 'app.js',
    path: __dirname + '/build',
  },

  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react'],
        },
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!sass-loader',
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.json', '.css', '.scss'],
  },
}
