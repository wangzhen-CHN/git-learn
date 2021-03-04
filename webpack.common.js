const { resolve } = require('path')
const webpack = require('webpack')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const MiniCssExtractLoader = require('mini-css-extract-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const { __DEV__, PROJECT_NAME, PROJECT_ROOT, DEFAULT_PORT, IP } = require('../utils/constants.js')
function getCssLoaders(importLoaders) {
  return [
    __DEV__ ? 'style-loader' : MiniCssExtractLoader.loader,
    {
      loader: 'css-loader',
      options: {
        modules: false,
        // 前面使用的每一个 loader 都需要指定 sourceMap 选项 生产环境关闭css sourcemap
        sourceMap: __DEV__ ? true : false,
        // 指定在 css-loader 前应用的 loader 的数量
        importLoaders
      }
    },
    {
      loader: 'postcss-loader',
      options: { sourceMap: true }
    }
  ]
}

const commonConfig = {
  context: PROJECT_ROOT,
  entry: [resolve(PROJECT_ROOT, './src/main.js')],
  resolve: {
    // 我们导入文件 等模块一般不写后缀名，webpack 会尝试使用这个数组提供的后缀名去导入
    extensions: ['.js', '.vue'],
    modules: ['node_modules'], // 指定查找目录
    alias: {
      '@': resolve(PROJECT_ROOT, './src'),
      'element-ui': resolve(PROJECT_ROOT, './node_modules/@zg/element-ui')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        oneOf: [
          {
            test: /\.jsx?$/,
            use: [{ loader: 'thread-loader', options: { workers: 3 } }, 'babel-loader?cacheDirectory'],
            include: [resolve(PROJECT_ROOT, './src'), resolve(PROJECT_ROOT, './node_modules/vue-smart-parse')],
            exclude: resolve(PROJECT_ROOT, ' ./node_modules')
          },
          {
            test: /\.pug$/,
            loader: 'pug-plain-loader',
            include: [resolve(PROJECT_ROOT, './src')]
          },
          {
            test: /\.css$/,
            use: ['cache-loader', ...getCssLoaders(0)]
          },
          {
            test: /\.styl(us)?$/,
            use: [
              'cache-loader',
              ...getCssLoaders(3),
              {
                loader: 'stylus-loader',
                options: {
                  sourceMap: true
                }
              },
              {
                loader: 'style-resources-loader',
                options: {
                  patterns: [
                    resolve(PROJECT_ROOT, './src/assets/styles/mixins.styl'),
                    resolve(PROJECT_ROOT, './src/assets/styles/variables.styl')
                  ]
                }
              }
            ]
          },
          {
            test: /\.scss$/,
            use: [
              'cache-loader',
              ...getCssLoaders(2),
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          },
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            use: [
              {
                loader: 'url-loader',
                options: {
                  esModule: false,
                  // 低于 10 k 转换成 base64
                  limit: 10 * 1024,
                  // 在文件名中插入文件内容 hash，解决强缓存立即更新的问题
                  name: '[name].[contenthash:7].[ext]',
                  outputPath: 'images'
                }
              }
            ]
          },
          {
            test: /\.svg$/,
            use: [
              {
                loader: 'svg-sprite-loader',
                options: {
                  symbolId: 'icon-[name]',
                  spriteAttrs: {
                    viewBox: '0 0 108 108'
                  }
                }
              }
            ]
          },
          {
            test: /\.(ttf|woff|woff2|eot|otf)$/,
            use: [
              {
                loader: 'url-loader',
                options: {
                  limit: 10 * 1024,
                  name: '[name]-[contenthash].[ext]',
                  outputPath: 'fonts'
                }
              }
            ]
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [
          `${PROJECT_NAME} is running here  http://${IP}:${DEFAULT_PORT}
                                      http://localhost:${DEFAULT_PORT}`
        ],
        clearConsole: false,
        additionalFormatters: [],
        additionalTransformers: []
      }
    }),
    new webpack.ProgressPlugin()
  ]
}

module.exports = commonConfig
