const path = require("path")

const glob = require('glob');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.conf');
const merge = require('webpack-merge');
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
            hash: true
        })
    })
    return HtmlPluginLists
}
module.exports = merge(baseWebpackConfig, {
    mode: "development",
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        ...entryList('./src/view/**/*.html'),
    ],
    devtool: "inline-source-map",
    devServer: {
        /**
         * 使用zip压缩
         */
        compress: true,
        contentBase: path.join(__dirname, "dist"),
        port: '8080',
        open: true,
        publicPath: "/",
        watchOptions: {
            poll: true
        }
    }
})