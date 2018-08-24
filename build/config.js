var path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    // getFileNameList: 
}

// 获取路径文件名
function getFileNameList(path) {
    let fileList = [];
    let dirList = fs.readdirSync(path);
    dirList.forEach((item) => {
        if (item.indexOf('html') > -1) {
            fileList.push(item.split('.')[0])
        }
    })
    return fileList
}

let htmlDirs = getFileNameList('../src/view');
let HTMLPlugins = []; // 保存HTMLWebpackPlugin实例
let Entries = {}; // 保存入口列表
// 生成HTMLWebpackPlugin实例和入口列表
htmlDirs.forEach((page) => {
    let htmlConfig = {
        filename: `${page}.html`,
        template: path.join('../src/view', `./${page}.html`) // 模板文件
    };
    let found = config.ignorePages.findIndex((val) => {
        return val === page;
    });
    if (found === -1) { // 有入口js文件的html，添加本页的入口js和公用js，并将入口js写入Entries中
        htmlConfig.chunks = [page, 'commons'];
        Entries[page] = `./src/${page}.js`;
    } else { // 没有入口js文件，chunk为空
        htmlConfig.chunks = [];
    }
    const htmlPlugin = new HTMLWebpackPlugin(htmlConfig);
    HTMLPlugins.push(htmlPlugin);
});