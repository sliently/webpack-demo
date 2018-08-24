const path = require("path")
const baseWebpackConfig = require('./webpack.base.conf');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const glob = require('glob')
const PurifyCSSPlugin = require('purifycss-webpack')
const webpack = require('webpack')
let lists = []
let HtmlPluginLists = []

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
        HtmlPluginLists[index] = new HtmlWebpackPlugin({
            filename: item.name + '.html',
            template: item.src + '.html',
            chunks: [item.name, "common"],
            vendor: './vendor.dll.js',
            inject: true,
            hash: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            }
        })
    })
    return HtmlPluginLists
}
module.exports = merge(baseWebpackConfig, {
    mode: "production",
    output: {
        publicPath: '/'
    },
    plugins: [
        new CleanWebpackPlugin('dist', {
            root: path.join(__dirname, '..'),
            exclude: ['manifest.json', 'vendor.dll.js'],
            verbose: true,
            dry: false
        }),
        ...entryList('./src/view/**/*.html'),
        new OptimizeCSSPlugin({
            cssProcessorOptions: { safe: true }
        }),
        new PurifyCSSPlugin({
            paths: glob.sync(path.join(__dirname, 'src/view/**/*.html'))
        }),
        // 多线程打包，
        new WebpackParallelUglifyPlugin({
            uglifyJS: {
                output: {
                    beautify: false, //不需要格式化
                    comments: false //不保留注释
                },
                compress: {
                    warnings: false, // 在UglifyJs删除没有用到的代码时不输出警告
                    drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
                    collapse_vars: true, // 内嵌定义了但是只用到一次的变量
                    reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
                }
            }
        }),
        // new webpack.DllReferencePlugin({
        //     manifest: path.resolve(__dirname, '..', 'dist', 'manifest.json')
        // })
    ],
    devtool: 'eval-source-map'
})


