const path = require('path');
module.exports = {
  // context: path.resolve(__dirname, "src"),
  entry: {
    'AboutPage': path.resolve(__dirname, 'src', 'AboutPageApp.js'),
    'HomePage': path.resolve(__dirname, 'src', 'HomePageApp.js'),
    'PeoplePage': path.resolve(__dirname, 'src', 'PeoplePageApp.js'),
    // 'home': path.resolve(__dirname, 'src', 'home.js')
    // 'app': path.resolve(__dirname, 'src', 'components', 'separations', 'app.js')
  },
  output: {
    path: path.resolve(__dirname, 'build', 'static', 'frontend'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              query: {
                name: 'assets/[name].[ext]'
              }
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              query: {
                mozjpeg: {
                  progressive: true,
                },
                gifsicle: {
                  interlaced: true,
                },
                optipng: {
                  optimizationLevel: 7,
                }
              }
            }
          }]
      }
    ]
  }
};
