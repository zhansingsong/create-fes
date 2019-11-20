# fes
**fes(front end scaffold)**，发音：/fes/。它是基于 webpack4、koa2 搭建的多页面开发环境。高效开发，快速打包。

[English DOC](./README_EN.md)

## 项目目录结构

```c
├── .babelrc ---> babel配置文件
├── .browserslistrc ---> browserslist 配置文件。postcss、babel 会根据其配置进行编译。更多参考: https://github.com/browserslist/browserslist
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

如果 `app.config.js` 提供的配置项不能满足你的项目需要，可以通过 `webpack.dev.config.js` 和 `webpack.prod.config.js` 进行重写定制。
```c
├── webpack.dev.config.js
└── webpack.prod.config.js
```

### src 文件夹

```c
├── api ---> 使用 mockjs 模拟 api
├── assets ---> 资源文件
├── javascripts ---> js 源代码文件夹（根据该目录下直接 js 文件生成 entry）
├── mock ---> 模板变量数据。支持 js、json 格式，及多文件数据(index.1.json, index.2.json.....)。其中 `common` 是公用 mock 数据。
├── styles ---> scss 源代码文件夹
└── views ---> template 源代码文件夹
```

### `app.config.js` 配置
- **isHot**：是否开启热加载，默认为`true`。只在开发模式下有效。
- **proxy**：配置 proxy。[详细配置参考……](https://github.com/chimurai/http-proxy-middleware)
- **babelLoader**：配置babel-loader，默认为`{}`。[详细配置参考……](https://github.com/2createStudio/postcss-sprites)
- **spritesConfig**：配置 sprites。[详细配置参考……](https://github.com/2createStudio/postcss-sprites)
- **urlLoader**：配置url-loader。[详细配置参考……](https://github.com/webpack-contrib/url-loader)
- **sw**：service worker 配置，默认为`{}`。[详细配置参考……](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin)
- **tsChecker**：fork-ts-checker-webpack-plugin 配置，默认为`{}`。[详细配置参考……](https://github.com/Realytics/fork-ts-checker-webpack-plugin#readme)
- **extraDependencies**：增加额外的依赖文件。方便开发修改时，能自动编译。相对于 'src' 目录，支持 `'**/*.js'` 形式。[详细配置参考……](https://github.com/isaacs/node-glob)
- **tmplLoader**: 设置模板语言 loader， 默认为 `twig-loader`。
  ```js
  tmplLoader: {
    test: /\.pug$/,
    loader: 'pug-loader',
    options: {},
  }
  ```
- **styleLoader**: 设置css预处理 loader，默认为 `sass-loader`。如果不想使用任何预处理器，只需将 `styleLoader: false` 即可。
  ```js
  styleLoader: {
    test: /\.less$/,
    loader: 'less-loader',
    options: {},
  }
  ```
- **htmlLoaderOptions**: `html-loader` 的 options。
- **alias**：alias 配置项。其中 `@` 表示 'src' 目录。
- **provide**：provide plugin 配置，默认为 `{}`。[详细配置参考……](https://webpack.js.org/plugins/provide-plugin/)
- **mockConfig**：配置模板数据以接口的形式提供。
  ```js
  mockConfig: {
    // 访问路径作为key
    '/index': {
      // 提供渲染mock数据接口
      api: 'https://postman-echo.com/get?page=index',
      // 格式化接口数据
      format: data => data.args,
    },
    '/fes/info': {
      api: 'https://postman-echo.com/get?page=info',
      format: data => data.args,
    },
  },
  ```
- **routerConfig**：路由配置项，可以自定义页面的路由映射。
  ```js
  '/your/path': 'index.html' // 默认：'/index': 'index.html'
  ```
- **cssModules**：配置 css modules，默认为 `'global'`。[详细配置参考……](https://github.com/webpack-contrib/css-loader#modules)。_如果不需要，建议关闭。这样可让 webpack 编译更快。_


- **dev**：开发模式
  - **port**：端口号，默认为`3000`
  - **autoOpen**：是否自动打开浏览器，默认为 `true`。支持 boolean 、String。如果存在 `/index`, 默认打开 `/index`，否则其中某个页面。如果是字符串(如: '/home')，就当成打开路径。如果路径不存在会回退到 boolean。
  - **qrcode**：是否生成预览二维码，默认为 `true`
  - **sourceMap**：是否开启 sourceMap，默认为 `true`。
  - **devtool**：配置 devtool，默认为 `'cheap-module-source-map'`。[详细配置参考……](https://webpack.js.org/configuration/devtool/#root)
  - **focus**：表示只编译指定的路由模板文件，提高编译速度。支持 String、Array，默认值为 `''`。
- **build**：生产模式
  -  **foolMode**：开启 fool 模式，如果开启会关闭 splitChunks。默认为 `false`。
  -  **debug**：开启 debug 模式，不会对打包文件进行压缩处理。
  - **publicPath**：输出路径，默认为'/'
  - **outputPath**：配置资料文件输出路径。支持字符串或对象，字符串表示path。如果想精细定制，可以使用对象形式：`{path, filename, chunk(仅js有效)}`
    - isHash：是否开启 hash。默认为 `true`
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
  - **report**：是否生成打包分析报告，默认为 `false`。支持 boolean 、object。如果为 `true`，使用默认配置生成分析报告。如果为配置 object， 会根据该配置对象生成分析报告。[配置object](https://github.com/webpack-contrib/webpack-bundle-analyzer)
  - **isTmpl**：是否输出后端模板，默认为 `false`
  - **sourceMap**：是否开启 sourceMap，默认为 `false`。
  - **devtool**：配置 devtool，默认为 `false`。[详细配置参考……](https://webpack.js.org/configuration/devtool/#root)
  -  **htmlMinify**：是否压缩html文件，默认 `false`。[详细配置参考……](https://github.com/jantimon/html-webpack-plugin#minification)
  - **optimizeCssAssetsPlugin**：压缩 css 配置。[详细配置参考……](https://github.com/NMFR/optimize-css-assets-webpack-plugin)
  - **splitChunks**：splitChunks 配置。[详细配置参考……](https://webpack.js.org/plugins/split-chunks-plugin/)

- **tmpl**：tmpl预览模式，**注意：该模式只能在 `isTmpl: true` 生效**
  - **port**：端口号，默认为`3100`
  - **autoOpen**：是否自动打开浏览器，默认为 `true`
  - **qrcode**：是否生成预览二维码，默认为 `true`
- **preview**：预览模式
  - **port**：端口号，默认为`3030`
  - **autoOpen**：是否自动打开浏览器，默认为 `true`
  - **qrcode**：是否生成预览二维码，默认为 `true`

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

### mockConfig

- Background
  在前后端复用模板时，存在一个问题（不知道大家是否有这样感觉）：在拼接模板时，变量数据需要后端以文档形式给出。但这样不仅存在信息同步性的问题，而且前后端开发起来不是很方便。前端需要对模板数据进行 mock，有时很难模拟线上数据环境；后端更新数据结构时，可能没有及时同步给前端等
- Solution
  这里需要后端对模板渲染数据做些额外的处理工作。需要额外提供一个包含了渲染模板的数据的接口供前端使用（只存在开发环境下，在上线时需要关闭掉）。这没有什么开发成本。只需对该接口定义特定前缀，然后在模板渲染逻辑之前拦截输出数据。这样不仅能保持数据一致性，而且维护起来也方便。
- Usage
  ```js
  mockConfig: {
    // 访问路径作为key
    '/index': {
      // 提供渲染mock数据接口
      api: 'https://postman-echo.com/get?page=index',
      // 格式化接口数据
      format: data => data.args,
    },
    '/fes/info': {
      api: 'https://postman-echo.com/get?page=info',
      format: data => data.args,
    },
  }
  ```
  同时开发模式下可以输入`mock`指令来获取对应的 mock 数据
  ```bash
  $ mock
  Mock Data:

  {
      "common": "commons",
      "name": "fes-index-page",
      "data": {
          "name": "fes"
      }
  }
  ```
  另外，除了`mock`指令，还提供了如下器指令：

  - mock: 查看当前的 mock 数据
  - view: 打印范围地址和二维码信息
  - clear: 清空控制台


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

_注意：图片的引用必须相对于入口页面，推荐使用绝对路径引用方式。因为如果存在多级入口的目录结构很难维护相对引用方式_

html：绝对路径引用

```html
<!-- alias: @:/Users/singsong/github/fes/src -->
<img src="@/assets/puppy.jpg" alt="">
<div style="background-image: url('${require(`@/assets/puppy.jpg`)}')">
```

html：相对路径是相对入口 html 文件引用

```html
<!-- 直接引用 -->
<img src="../assets/puppy.jpg" alt="">
<!-- 嵌入方式 -->
<div style="background-image: url('${require(`../assets/puppy.jpg`)}')">
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
