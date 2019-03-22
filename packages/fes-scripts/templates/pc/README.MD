# fes

fes(front end scaffold)，发音：/fes/。它是基于 webpack4、koa2、babel、eslint、stylelint、prettier、husky、lint-staged 搭建的多页面开发环境。高效开发，快速打包。

## features

- [x] 兼容 macOS、windows、Linux 等操作系统，及 IE 低版本
- [x] 支持 ES6 语法、scss
- [x] 不仅支持 js-code-splitting，同时支持 css-code-splitting
- [x] 多页面开发环境
- [x] proxy
- [x] css autoprefixer
- [x] 支持更灵活定制，如是否自动打开浏览器、热加载等配置
- [x] css/svg sprite
- [x] 自动监听 port，如果占用，提示性切换
- [x] 打包优化分析
- [x] 模板输出(便于后端共用模板)
- [x] elsint + stylelint + prettier
- [x] pre-commit 时 lint-staged 校验
- [x] [mockjs](https://github.com/nuysoft/Mock/wiki/Getting-Started)模拟 api

## 配置stylelint、vscode-stylelint、prettier-stylelint
为什么需要stylelint，默认vscode对样式检测比较简单。
- [stylelint](https://stylelint.io/)：更加专业，功能更多。安装并添加配置文件stylelint.config.js
- [vscode-stylelint](https://marketplace.visualstudio.com/items?itemName=shinnn.stylelint)：是一个vscode插件，用于将stylelint集成到vscode中，方便检测样式。


~~安装并对vscode做如下修改：~~
```
"css.validate": false,
"less.validate": false,
"scss.validate": false
```
_上述配置已配置fes工作环境中_



关闭vscode内置的样式检测，使用stylelint代替。
- [prettier-stylelint](https://github.com/hugomrdias/prettier-stylelint)：根据stylelint配置文件进行自动修复插件。

- [stylelint-config-idiomatic-order](https://github.com/ream88/stylelint-config-idiomatic-order)：规范化样式的书写顺序。

[参考文章](https://medium.freecodecamp.org/integrating-prettier-with-eslint-and-stylelint-99e74fede33f)

## 配置prettier-eslint

配置 prettier-eslint 可以让 prettier 根据 eslint 规则格式化代码。(配置只对 vscode 有效)

- 安装[Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)插件
- 安装 prettier-eslint：`npm install --save-dev prettier-eslint`
- vscode 中 settings 中配置 prettier：`"editor.formatOnSave": true`

> 注意：使用prettier格式化修复时，需要将其他格式化插件(如：Beautify)关闭掉，不然格式化修复可能不会生效。

## structure

```css
├── .babelrc --->babel配置文件
├── .editorconfig --->editor配置文件
├── .eslintignore --->eslint忽略配置文件
├── .eslintrc.js --->eslint配置文件
├── README.MD
├── build --->打包文件夹
├── config --->配置文件夹
├── package.json
├── deploy.sh --->部署脚本
├── app.config.js ---> 定制文件
├── public --->公用资源
└── src --->源代码文件夹
```

### src 文件夹

```js
├── api --->使用mockjs模拟api
├── assets --->资源文件
├── javascripts --->js源代码文件夹: 根据该目录下直接js文件生成entry
├── mock --->mock数据，支持js、json格式，及多文件数据(index.1.json, index.2.json.....)
├── styles --->scss源代码文件夹
└── views --->twig源代码文件夹: 根据该目录下直接twig文件来生成页面，即页面需要与twig文件保持一致
```

## 配置

`app.config.js`提供如下配置项：

- isBabel: 是否开启 babel，默认为`true`
- isHot: 是否开启热加载，默认为`true`，只在开发模式下有效
- proxy: 配置 proxy，更多参考: [https://github.com/chimurai/http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)
- provide: 自动加载模块配置，默认为`{}`
- spritesConfig: 配置 sprites，更多参考: [https://github.com/2createStudio/postcss-sprites](https://github.com/2createStudio/postcss-sprites)
- alias: alias配置项
- routerConfig: 路由配置项，可以自定义页面的路由映射。
  ```
  // 重新定义不会启动默认配置。即需要指定项目所有的页面路由
  '/your/path': 'index.html'
  ```
- dev: 开发模式
  - port: 端口号，默认为`3000`
  - autoOpen: 是否浏览器自动打开，默认为`true`
  - qrcode: 是否生成预览二维码，默认为`true`
  - sourceMap: 是否开启 sourceMap，默认为`true`
  - devtool: 配置 devtool
- build: 生成模式

  - publicPath: 输出路径，默认为'/'
  - outputPath: 配置资料文件输出路径。支持字符串或对象，字符串表示path。如果想精细定制，可以使用对象形式：`{path, filename, chunk(仅js有效)}`

        - css: css 输出路径
        - others: 除了 css、img、js 文件外的资源输出路径
        - img: img 输出路径
        - js: js 输出路径
        `{
          path: 'static/css/',
          filename: '[name].[chunkhash:8].js',
          chunck: '[name].[chunkhash:8].chunk.js',
        }`

  - sourceMap: 是否开启 sourceMap，默认为`true`
  - devtool: 配置 devtool
  - report: 是否开启打包分析报告，默认为`false`
  - isTmpl: 是否输出模板，默认为`false`

- tmpl: 开发模式，**注意：该模式只能在`isTmpl: true`生效**
  - port: 端口号，默认为`3100`
  - autoOpen: 是否浏览器自动打开，默认为`true`
  - qrcode: 是否生成预览二维码，默认为`true`
- preview: 开发模式
  - port: 端口号，默认为`3030`
  - autoOpen: 是否浏览器自动打开，默认为`true`
  - qrcode: 是否生成预览二维码，默认为`true`

## usage

- 安装依赖包

```js
npm install
```

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

- 模板输出预览

```js
npm run tmpl
```

- 部署预览

_注意：首页需要将 [git@git.dh.sogou-inc.com:fe/fe-deploy.git](http://git.dh.sogou-inc.com/fe/fe-deploy) clone 到本地项目中。_

```js
npm run deploy
```

按照提示输入项目名，执行完脚本，访问 [http://10.134.76.170:8888/](http://10.134.76.170:8888/) 即可。

## todolist

- [ ] 增加命令安装
- [ ] 增加其他模板引擎
- [ ] 增加tmpl输出配置
- [ ] 处理轻逻辑build输出

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

可以开启`css modules`，不过它更适合与 js 混合开发模式，如 react、vue 开发。

- [CSS modules break build if used with `~`](https://github.com/webpack-contrib/css-loader/issues/589#issuecomment-365942989)
- [@imports not resolving when css-modules enabled ](https://github.com/webpack-contrib/css-loader/issues/436)
- [CSS Modules & Sass in Create React App](https://medium.com/@kswanie21/css-modules-sass-in-create-react-app-37c3152de9)
