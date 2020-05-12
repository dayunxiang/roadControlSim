const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const httpENV = process.env.http_ENV === 'production'
// const styleLoader = httpENV ? { loader: MiniCssExtractPlugin.loader, options: { publicPath: '../' } } : { loader: 'style-loader' }
const webpackConfig = {
  mode: process.env.http_ENV,
  entry: ['babel-polyfill', './main.jsx'],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: httpENV ? 'js/[name].[Hash:8].js' : '[name].[Hash:8].js',
    chunkFilename: httpENV ? 'js/[name].[Hash:8].js' : '[name].[Hash:8].js',
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|mp4|gif|mov)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              outputPath: httpENV ? '/images' : '',
              name: '[hash:8].[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: path.resolve(__dirname, 'svgImgs'), // //只处理指定svg的文件
        options: {
          symbolId: '[name]',
        },
      },
      { test: /\.(eot|woff|woff2|ttf|svg|otf)([?]?.*)$/, use: 'file-loader' },
      {
        test: /\.js|jsx$/,
        exclude: [/node_module/, /svgImgs/],
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-0'],
        },
      },
      {
        test: /\.css$/,
        // use: [ styleLoader, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
        use: [httpENV ? { loader: MiniCssExtractPlugin.loader } : { loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
      },
      {
        test: /\.scss$/,
        use: [
          httpENV ? { loader: MiniCssExtractPlugin.loader, options: { publicPath: '../', hmr: !httpENV } } : { loader: 'style-loader' },
          // styleLoader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 2,
              localIdentName: '[name]_[local]__[hash:base64:5]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              config: {
                path: 'postcss.config.js', // 在项目根目录创建此文件
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              modules: true,
              localIdentName: '[name]_[local]__[hash:base64:5]',
            },
          },
        ],
      },
      { test: /\.html$/, use: 'html-loader' },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'], //  'eslint-loader'
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'], // 省略后缀
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new HtmlWebpackPlugin({
      favicon: './favicon.ico',
      template: 'template.html',
      filename: 'index.html',
      inject: true,
      hash: false,
    }),
    new MiniCssExtractPlugin({
      filename: httpENV ? 'css/[name].[Hash].css' : '[name].[hash].css',
      chunkFilename: httpENV ? 'css/[id].[Hash].css' : '[id].[hash].css',
    }),
    new CleanWebpackPlugin(),
  ],
}
if (!httpENV) { // 如果是开发环境
  webpackConfig.devServer = {
    proxy: {
      '/simulation': {
        target: 'http://221.13.10.30:20199/',// http://221.13.10.30:20199/
        // pathRewrite: { '^/api': '' },
        // changeOrigion: true, // 这个参数可以让target参数是域名。
        secure: false, // 设置后，可以接受运行在 HTTPS 上，可以使用无效证书的后端服务器
      },
    },
    port: 11180,
    contentBase: './build',
    historyApiFallback: true,
    hot: true,
    inline: true,
    compress: true,
  }
  webpackConfig.devtool = 'source-map'
}

module.exports = webpackConfig
