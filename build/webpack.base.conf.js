var path = require('path');
const chalk = require('chalk');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const HappyPack = require('happypack')
const os = require('os')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
function resolve(dir) {
    return path.join(__dirname, '..', dir)
}
function assetsPath(_path_) {
    let assetsSubDirectory;
    if (process.env.NODE_ENV === 'production') { // 这里需要用cross-env来注入Node变量
        assetsSubDirectory = 'static' //可根据实际情况修改
    } else {
        assetsSubDirectory = 'static'
    }
    return path.posix.join(assetsSubDirectory, _path_)
}

let lists = []
let entryLists = {}

function getList(path) {
    var list = glob.sync(path);
    list.forEach((item, index) => {
        var name = item.split('/')[4].split('.')[0]
        lists[index] = {}
        lists[index].name = name;
        lists[index].src = item.split('.html')[0]
    })
}
function entryList(path) {
    getList(path);
    lists.forEach((item, index) => {
        entryLists[item.name] = item.src + '.js'
    })
    return entryLists
}
module.exports = {
    context: path.resolve(__dirname, '../'),
    entry: entryList('./src/view/**/*.html'),
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'static/js/[name]-[hash].js'
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: path.resolve(__dirname, '../dist/static'),
                ignore: ['.*']
            }
        ]),
        new MiniCssExtractPlugin({
            filename: "static/css/[name].css",
            chunkFilename: "[name].css"
        }),
        new HappyPack({ //开启多线程打包
            id: 'happy-babel-js',
            loaders: ['babel-loader?cacheDirectory=true'],
            threadPool: happyThreadPool
        }),
        new ProgressBarPlugin({
            format: 'build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)'
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'css-hot-loader',
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            config: {
                                path: 'path/to/postcss.config.js'
                            }
                        }
                    }
                ],
                include: [resolve('src')], //限制范围，提高打包速度
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        name: assetsPath('images/[name].[hash:7].[ext]'),// 图片输出的路径
                        limit: 1000
                    }
                },
                include: [resolve('src')],
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                include: [resolve('src')],
                options: {
                    name: assetsPath('images/[name].[hash:7].[ext]'),// 图片输出的路径
                    limit: 1000
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                include: [resolve('src')],
                options: {
                    name: assetsPath('images/[name].[hash:7].[ext]'),// 图片输出的路径
                    limit: 1000
                }
            },
            {
                test: /\.js?$/,
                loader: 'happypack/loader?id=happy-babel-js',
                include: [resolve('src')],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".js", ".json"],
        alias: {
            "@": resolve("src")
        }
    },
    optimization: {
        // minimizer: true,
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: "initial",
                    name: "common",
                    minChunks: 2,
                    maxInitialRequests: 5, // The default limit is too small to showcase the effect
                    minSize: 0 // This is example is too small to create commons chunks
                }
            }
        }
    }
}
