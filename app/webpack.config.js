const path = require("path");
const webpack = require('webpack');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: {
    index:"./src/index.js",
    'market':'./src/market.js',
    'create':'./src/create.js',
    'mytoken':'./src/mytoken.js',
    'record':'./src/record.js',
    'P2':'./src/P2.js',
    'index1':'./src/index1.js',
    'product':'./src/product.js',
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "./src/index.html", to: "index.html" },
      { from: "./src/market.html", to: "market.html"},
      { from: "./src/create.html", to: "create.html"},
      { from: "./src/mytoken.html", to: "mytoken.html"},
      { from: "./src/record.html", to: "record.html"},
      { from: "./src/P2.html", to: "P2.html"},
      { from: "./src/index1.html", to:"index1.html"},
      { from: "./src/product.html", to:"product.html"},
    ]),
    new webpack.DefinePlugin({
      ETH_NODE_URL: JSON.stringify(process.env.ETH_NODE_URL),
      IPFS_API_HOST: JSON.stringify(process.env.IPFS_API_HOST),
      IPFS_API_PORT: JSON.stringify(process.env.IPFS_API_PORT),
      IPFS_GATEWAY_URL: JSON.stringify(process.env.IPFS_GATEWAY_URL)
    }),
    new webpack.ProvidePlugin({
           $: "jquery",
           jQuery: "jquery"
    }),
  ],
  module: {
    rules: [
      {
       test: /\.css$/,
       use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use:{
          loader: 'babel-loader',
          options: {
            presets:['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      },
      {
        test: /\.(png|svg|jpg|gif|ttf|woff|woff2|eot)$/,
        use: ['url-loader']
        },

    ]
  },
  devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
};
