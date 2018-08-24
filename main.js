const fs = require('fs')
let dirList = fs.stat('./src/view', function (err, stats) {
    console.log(stats)
});
console.log(dirList)
// function getFileNameList(path) {
//     let fileList = [];
//     let dirList = fs.readdirSync(path);
//     dirList.forEach((item) => {
//         if (item.indexOf('html') > -1) {
//             fileList.push(item.split('.')[0])
//         }
//     })
//     return fileList
// }