## webpack4.0 爬坑记

> 爬了好久的webpack，第一次上手时，就已经是webpack4了，最近又重新来熟悉了一波，

仔细一看，webpack4真的是一个跨时代的作品，对比webpack3有了一个质的飞跃。

1. 新的公共代码抽离工具（optimization.SplitChunksPlugin），提取重用代码，减少打包文件。代替了commonchunkplugin。(不得不说我在这里踩了很大的一个坑，因为是首次学习webpack，对webpack3不清楚，结果就是学习webpack4的过程中)
2. 使用HappyPack进行javascript的多进程打包操作。提升打包速度，并增加打包时间显示。
3. webpack4多了几项配置项：mode，optimization。webpack4必须指定是生产环境还是开发环境，不然会报warning
4. 创建一个weboack.dll.config.js文件打包到类库dll中，使得开发过程中不会重复进行打包。可以大大缩减开发环境打包时间。

```
npm i purify-css purifycss-webpack -D // 用于css的tree-shaking
npm i webpack-parallel-uglify-plugin -D // 用于js的tree-shaking
npm i happypack@next -D //用于多进程打包js
npm i progress-bar-webpack-plugin -D //用于显示打包时间和进程
npm i webpack-merge -D //优化配置代码的工具
npm i optimize-css-assets-webpack-plugin -D //压缩CSS
npm i chalk -D
npm install css-hot-loader -D // css热更新
npm i mini-css-extract-plugin -D // 代替了之前的ExtractTextWebapckPlugin css代码分离
npm i cross-env -D // 各个系统环境变量可以进行统一设置
```

以下是一些基础配置

```javascript
 <!--复制静态资源文件-->
    new CopyWebpackPlugin([
        {
            from: path.resolve(__dirname, '../static'),
            to: path.resolve(__dirname, '../dist/static'),
            ignore: ['.*']
        }
    ]),
    <!--分离js中的css，以link标签插入-->
    new MiniCssExtractPlugin({
        filename: "static/css/[name].css",
        chunkFilename: "[name].css"
    }),
    <!--多线程打包-->
    new HappyPack({ //开启多线程打包
        id: 'happy-babel-js',
        loaders: ['babel-loader?cacheDirectory=true'],
        threadPool: happyThreadPool
    }),
    <!--打包时间显示-->
    new ProgressBarPlugin({
        format: 'build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)'
    })
```
> 其实我觉得webpack4已经有了时间显示了，在命令行加一个--progress，就能显示加载进度。许多配置只需要加一个命令就可以了

> postcss-loader，在这里我有必要说一下这个，真的是一个很好的一个工具，可以省却很多css的书写。`autoprefixer`这是postcss-loader的一个插件。打包的时候能自动帮你加浏览器前缀。我觉得是很好用的。方便了许多

在根目录下建立一个postcss.config.js的配置文件

```javascript
module.exports = {
  plugins: [
    require("autoprefixer")
  ]
  // "plugins": {
  //   // "postcss-import": {},
  //   // "postcss-url": {},
  //   // to edit target browsers: use "browserslist" field in package.json
  //   "autoprefixer": {}
  // }
}

```

在css配置中,需要注意一点就是loader是从右往左加载，所以先加载的要放在右边。顺序要注意

```js
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
    }
```

##### splitChunks,这是webpack新增的一个api

```javascript
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
```
##### 最后谈一下多页面吧！

> 其实多页面无非就是动态加载入口，动态加载HtmlWebpackPlugin这个插件生成html模板文件

```javascript
const glob = require('glob'); //动态匹配文件路径
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

entryList('./src/view/**/*.html')。 这里是我需要匹配的地方。
```

最后奉上我自己的webpack4多页面配置吧！虽然配置的不怎么好。但是总是能学到一点东西吧。


### 总结

> 其实在这次学习中，能理解到一些有关前端优化的问题，学到了node中glob这个插件的使用，推荐几个插件 nodemon 自动重新启动node。可以方便node开发，nrm，一个npm的包拉取管理器，可以迅速切换包的来源，纪录的东西比较少。以后需要多多学习