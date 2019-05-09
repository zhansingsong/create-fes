![logo](./media/logo.png)

**fes(front end scaffold)**，发音：**/fes/**。它是基于 [webpack4](https://github.com/webpack/webpack)、[koa2](https://github.com/koajs/koa) 搭建的多页面开发环境。高效开发，快速打包。

**create-fes** 是一个构建 **fes** 多页面应用的命令，灵感来源于[create-react-app](https://github.com/facebook/create-react-app)。

[English DOC](./README.md)
## 设计架构

![fes](./media/FES.svg)

**fes** 以 HTML 的文件名来关联 JS 和 DATA。 其中 JS 和 DATA 是可选的。而 SCSS 则通过 JS 引入，然后再使用 `mini-css-extract-plugin` 做优化。另外，**fes** 还提供了 `build`、`start`、`preview`、`tmpl` 脚本命令。
- 页面
## 安装
```js
npm install create-fes -g
```
如果不想安装`create-fes`，可以直接使用`npx`命令(推荐)
```js
npx create-fes <project-name>
```

## 使用
- 默认
```js
create-fes example
```
- `-B, --no-babel` 表示是否关闭`babel`。

```js
create-fes example -B
// or
create-fes example --no-babel
```
- `-t, --typescript` 表示是否开启`typeScript`。

```js
create-fes example -t
// or
create-fes example --typescript
```
- `-n, --npm` 表示直接使用 `npm` 安装依赖包。
```js
create-fes example -n
// or
create-fes example --npm
```
- `--scripts-version <alternative-package>` 表示使用一个自定义 `fes-scripts` 版本。

```js
create-fes example --scripts-version 1.0.x
```

- `-h, --help` 表示获取帮助信息。

```js
create-fes example -h
// or
create-fes example --help
```
## 自定义模板
在使用`create-fes`命令创建 fes-app 过程中，会提供模板选择功能:
```
What template do you need?
pc
other custom template(<path-to-template>)
```
选择`other custom template(<path-to-template>)`选项，提示
```
Please input a valid path of template?
$ /path/to/your/template #输入模板绝对路径
```


## 项目目录结构

```css
├── .babelrc ---> babel配置文件
├── .browserslistrc ---> browserslist 配置文件。postcss、babel 会根据其配置进行编译。更多参考：https://github.com/browserslist/browserslist
├── tsconfig.js ---> typeScript配置文件
├── README.MD
├── package.json
├── app.config.js ---> app 配置文件
├── build ---> 打包文件夹
├── config ---> 配置文件夹
├── public ---> 公用资源
└── src ---> 源代码文件夹
```
### config 配置文件夹
如果`app.config.js`提供的配置项不能满足你的项目需要，可以通过`webpack.dev.config.js`和`webpack.prod.config.js`进行重写定制。
```js
├── webpack.dev.config.js
└── webpack.prod.config.js
```

### src 文件夹

```js
├── api ---> 使用 mockjs 模拟 api
├── assets ---> 资源文件
├── javascripts ---> js 源代码文件夹（根据该目录下直接 js 文件生成 entry）
├── mock ---> 模板变量数据。支持 js、json 格式，及多文件数据(index.1.json, index.2.json.....)。其中`common`是公用 mock 数据。
├── styles ---> scss 源代码文件夹
└── views ---> template 源代码文件夹
```

### `app.config.js`配置
- **isHot**：是否开启热加载，默认为`true`。只在开发模式下有效。
- **proxy**：配置 proxy。[详细配置参考……](https://github.com/chimurai/http-proxy-middleware)
- **babelLoader**：配置babel-loader，默认为`{}`。[详细配置参考……](https://github.com/2createStudio/postcss-sprites)
- **spritesConfig**：配置 sprites。[详细配置参考……](https://github.com/2createStudio/postcss-sprites)
- **urlLoader**：配置url-loader。[详细配置参考……](https://github.com/webpack-contrib/url-loader)
- **sw**：service worker 配置，默认为`{}`。[详细配置参考……](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin)
- **tsChecker**：fork-ts-checker-webpack-plugin 配置，默认为`{}`。[详细配置参考……](https://github.com/Realytics/fork-ts-checker-webpack-plugin#readme)
- **extraDependencies**：增加依赖文件，方便开发修改时，能自动编译。相对于 'src' 目录，支持 `'**/*.js'` 形式。[详细配置参考……](https://github.com/isaacs/node-glob)
- **alias**：alias配置项。
- **provide**：provide plugin 配置，默认为`{}`。[详细配置参考……](https://webpack.js.org/plugins/provide-plugin/)
- **routerConfig**：路由配置项，可以自定义页面的路由映射。
  ```js
  '/your/path': 'index.html' // 默认：'/index': 'index.html'
  ```
- **cssModules**：配置css modules，默认为`'global'`。[详细配置参考……](https://github.com/webpack-contrib/css-loader#modules)。_如果不需要，建议关闭。这样可让 webpack 编译更快。_


- **dev**：开发模式
  - **port**：端口号，默认为`3000`
  - **autoOpen**：是否自动打开浏览器，默认为`true`。支持 boolean 、String。如果存在`/index`, 默认打开`/index`，否则其中某个页面。如果是字符串(如: '/home')，就当成打开路径。如果路径不存在会回退到 boolean。
  - **qrcode**：是否生成预览二维码，默认为`true`
  - **sourceMap**：是否开启 sourceMap，默认为`true`。
  - **devtool**：配置 devtool，默认为 `'cheap-module-source-map'`。[详细配置参考……](https://webpack.js.org/configuration/devtool/#root)
- **build**：生产模式
  -  **debug**：开启debug模式，不会对打包文件进行压缩处理。
  
  - **publicPath**：输出路径，默认为'/'
  - **outputPath**：配置资料文件输出路径。支持字符串或对象，字符串表示path。如果想精细定制，可以使用对象形式：`{path, filename, chunk(仅js有效)}`
    - isHash：是否开启 hash。默认为`true`
    - css：css 输出路径
    - others：除了 css、img、js 文件外的资源输出路径
    - img：img 输出路径
    - js：js 输出路径
    ```js
    {
      path: 'static/css/',
      filename: '[name].[chunkhash:8].js',
      chunck: '[name].[chunkhash:8].chunk.js',
    }
    ```
  - **report**：是否生成打包分析报告，默认为`false`。支持 boolean 、object。如果为`true`，使用默认配置生成分析报告。如果为配置 object， 会根据该配置对象生成分析报告。[配置object](https://github.com/webpack-contrib/webpack-bundle-analyzer)
  - **isTmpl**：是否输出后端模板，默认为`false`
  - **sourceMap**：是否开启 sourceMap，默认为`false`。
  - **devtool**：配置 devtool，默认为 `false`。[详细配置参考……](https://webpack.js.org/configuration/devtool/#root)
  -  **htmlMinify**：是否压缩html文件，默认`false`。[详细配置参考……](https://github.com/jantimon/html-webpack-plugin#minification)
  - **optimizeCssAssetsPlugin**：压缩 css 配置。[详细配置参考……](https://github.com/NMFR/optimize-css-assets-webpack-plugin)

- **tmpl**：tmpl预览模式，**注意：该模式只能在`isTmpl: true`生效**
  - **port**：端口号，默认为`3100`
  - **autoOpen**：是否自动打开浏览器，默认为`true`
  - **qrcode**：是否生成预览二维码，默认为`true`
- **preview**：预览模式
  - **port**：端口号，默认为`3030`
  - **autoOpen**：是否自动打开浏览器，默认为`true`
  - **qrcode**：是否生成预览二维码，默认为`true`

### 项目使用

- 开发

```js
npm start
```

- 打包

```js
npm run build
```

- 预览

```js
npm run preview
```

- 预览后端输出模板

```js
npm run tmpl
```

### css modules
_注意：默认开启 `global` 模式，要使用需要主动声明 `local`_

- scss

```scss
/* 文件名为：_cssm.scss */
:local(.cnt){
  position: fixed;
  left: 0;
  top: 30%;
  background-color: rgba(54, 54, 54, 0.486);
  box-shadow: 1px 1px 0.2rem rgba(2, 2, 2, 0.568);
  :local(.tt){
    font-size: 1rem;
    color: rgb(133, 233, 150);
  }
  :local(.des){
    background-color: rgb(19, 19, 19);
    color: #fff;
  }
}
```
- html
```html
<div class="cssm"></div>
```
- JS
```js
import cssm from '../styles/modules/_cssm.scss';

const getCssmHtml = cssmObj => (`
    <div class="${cssmObj.cnt}">
    <h3 class="${cssmObj.tt}">css-module</h3>
    <p class="${cssmObj.des}">介绍fes中css-modules的使用</p>
    </div>
  `);

const cssmContainer = document.querySelector('.cssm');
cssmContainer.innerHTML = getCssmHtml(cssm);
```
### 引用图片的方式

_注意：图片的引用必须相对于入口页面_

html：相对路径是相对入口 html 文件引用

```html
<!-- 直接引用 -->
<img src="../assets/puppy.jpg" alt="">
<!-- 嵌入方式 -->
<div style="background-image: url('${require(`../assets/puppy.jpg`)}')">
```

html：绝对路径引用

```html
<!-- alias: @:/Users/singsong/github/fes/src -->
<img src="@/assets/puppy.jpg" alt="">
<div style="background-image: url('${require(`@/assets/puppy.jpg`)}')">
```

scss：相对路径是相对入口的 scss 文件引用

```scss
.icons {
  background-image: url(../assets/husky.jpg);
  position: relative;
  padding: 10px 40px;
  overflow: hidden;
  background-color: #cbce08;
  .ant {
    float: left;
    background: url(../assets/sprite/ant1.png) no-repeat 0 0;
    height: 64px;
    width: 64px;
    &:hover {
      background-image: url(../assets/sprite/ant2.png);
      transform: scale(1.2);
    }
  }
}
```

scss：绝对路径引用

```scss
// alias: @:/Users/singsong/github/fes/src
.icons {
  background-image: url(~@/assets/husky.jpg);
  position: relative;
  padding: 10px 40px;
  overflow: hidden;
  background-color: #cbce08;
  .ant {
    float: left;
    background: url(~@/assets/sprite/ant1.png) no-repeat 0 0;
    height: 64px;
    width: 64px;
    &:hover {
      background-image: url(~@/assets/sprite/ant2.png);
      transform: scale(1.2);
    }
  }
}
```

### 注意事项

可以开启`css modules`，不过它更适合与 js 混合开发模式，如css-in-js、react、vue 开发。

- [CSS modules break build if used with `~`](https://github.com/webpack-contrib/css-loader/issues/589#issuecomment-365942989)
- [@imports not resolving when css-modules enabled ](https://github.com/webpack-contrib/css-loader/issues/436)
- [CSS Modules & Sass in Create React App](https://medium.com/@kswanie21/css-modules-sass-in-create-react-app-37c3152de9)

## TODO-LIST

- 支持其他常用的模板引擎，同时增加对应的模板。
- 完善文档，增加 examples
