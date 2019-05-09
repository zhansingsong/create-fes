# CREATE-FES

![logo](./media/logo.png)

Set up a modern multiple-page app by running one command. inspired by [create-react-app](https://github.com/facebook/create-react-app). 

**Fes**(front end scaffold), pronunciation: **/fes/**. It is build with [webpack4](https://github.com/webpack/webpack) and [koa2](https://github.com/koajs/koa), which is fast、lightweight、powerful and easy to use.

[中文文档](./README_CN.md)

## Architecture

![fes](./media/FES.svg)

**fes** Associates JS and DATA with the filename of the HTML. Where JS and DATA are optional. SCSS is introduced through JS and then optimized using `mini-css-extract-plugin`. In addition, **fes** also provides `build`, `start`, `preview`, `tmpl` script commands.

## Install
```js
npm install create-fes -g
```
If you don't install globally or locally, just do use `npx` command.(Recommend)
```js
npx create-fes <project-name>
```

## Usage
- Default
```js
create-fes example
```
- `-B, --no-babel` indicates not to enable babel.

```js
create-fes example -B
// or
create-fes example --no-babel
```
- `-t, --typescript` indicates to enable typescript.

```js
create-fes example -t
// or
create-fes example --typescript
```
- `-n, --npm` indicates to direct use npm install modules.

```js
create-fes example -n
// or
create-fes example --npm
```
- `--scripts-version <alternative-package>` indicates to use a non-standard version of fes-scripts.

```js
create-fes example --scripts-version 1.0.x
```

- `-h, --help` indicates to get help info.

```js
create-fes example -h
// or
create-fes example --help
```
## Custom template
Creating fes-app process with `create-fes` command, which offers to choice templates function:
```
What template do you need?
pc
other custom template(<path-to-template>)
```
Choosing `other custom template(<path-to-template>)` option, and then:
```
Please input a valid path of template?
$ /path/to/your/template #absolute path
```

## Structure in project by create-fes command

```css
├── .babelrc ---> babel config
├── .browserslistrc ---> browserslist config. postcss、babel compiling source code with browserslist. More info: https://github.com/browserslist/browserslist
├── tsconfig.js ---> typeScript config
├── README.MD
├── package.json
├── app.config.js ---> app config
├── build ---> build dir
├── config ---> config dir
├── public ---> public assets
└── src ---> source code dir
```

### Config dir
If it is disable to meet your project demands that `app.config.js` is applied, you can overwrite webpack config through `webpack.dev.config.js` and `webpack.prod.config.js`.
```js
├── webpack.dev.config.js
└── webpack.prod.config.js
```

### Source code dir
```js
├── api ---> mock api by mockjs
├── assets ---> assets dir
├── javascripts ---> js source code dir（webpack entry generated on the dir）
├── mock ---> template variables. supporting filename extensions to `js` and `json`, and multi-file pattern(index.1.json, index.2.json.....). `common` is public template data among them.
├── styles ---> sass source code dir
└── views ---> twig source code dir
```

### `app.config.js`
- **isHot**: Indicates whether the hmr is enabled. Default value is `true`(only dev mode).
- **proxy**: Proxy config. [detailed configuration reference...](https://github.com/chimurai/http-proxy-middleware)
- **babelLoader**：babel-loader config. Default value is `{}`. [detailed configuration reference...](https://github.com/babel/babel-loader)
- spritesConfig: postcss sprites config. Default value is `{}`. [detailed configuration reference...](https://github.com/2createStudio/postcss-sprites)
- **urlLoader**: url-loader config. [detailed configuration reference...](https://github.com/webpack-contrib/url-loader)
- **sw**: service worker config. Default value is `{}`. [detailed configuration reference...](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin)
- **tsChecker**: fork-ts-checker-webpack-plugin config, default value is `{}`. [detailed configuration reference...](https://github.com/Realytics/fork-ts-checker-webpack-plugin#readme)
- **extraDependencies**: Add other files as dependencies to watch for dev. glob pattern is available(the path is relative to `src`). [glob info](https://github.com/isaacs/node-glob)
- **alias**: webpack `resolve.alias` config.
- **provide**: webpack provide plugin config. [detailed configuration reference...](https://github.com/2createStudio/postcss-sprites)
- **cssModules**: css modules config. default value is `'global'`. [detailed configuration reference...](https://github.com/webpack-contrib/css-loader#modules)。_It is recommended to turn off if not needed. This will make webpack compile faster._
- **routerConfig**: router config. It is able to customize route map.
```js
  '/your/path': 'index.html' // default: /index: 'index.html'
```
- **dev**: development mode.
  - **port**: server port. Default value is `3000`.
  - **autoOpen**: Indicates whether the browser is opened automatically. default value is `true`. Support boolean, String type. The `/index` is turned on by default if exist, or one of the pages. If it is a string (such as: '/home'), it will be the open path. if the path does not exist, it will fall back to boolean.
  - **qrcode**: Indicates whether the qrcode is generated automatically. default value is `true`.
  - **sourceMap**: Indicates whether sourceMap is enabled. default value is `true`.
  - **devtool**: devtool config. Default value is `'cheap-module-source-map'`. [detailed configuration reference...](https://webpack.js.org/configuration/devtool/#root)
- **build**: production mode.
  - **debug**: debug mode. default value is `false`.
  - **publicPath**: public path. default value is '/'.
  - **outputPath**: output path config. the config can be `String` or `Object` type.
      - isHash: Indicates whether to enable hash in filename. Default value is `true`.
      - css: css output path.
      - others: assets apart from css、img、js files output path.
      - img: img output path.
      - js: js output path.
        ```js
        {
          path: 'static/css/',
          filename: '[name].[chunkhash:8].js',
          chunck: '[name].[chunkhash:8].chunk.js',
        }
        ```
  - **report**: Indicates whether a report is generated automatically. default value is `false`. Support Boolean and Object type. if `true`, generating an analysis report on the default configuration. if `object`, generating an analysis report on the config object.[config object](https://github.com/webpack-contrib/webpack-bundle-analyzer)
  - **isTmpl**: Indicates whether backend template is generated automatically. default value is `true`.
  - **sourceMap**: Indicates whether sourceMap is enabled. default value is `false`.
  - **devtool**: devtool config. Default value is `false`. [detailed configuration reference...](https://webpack.js.org/configuration/devtool/#root)
  - **htmlMinify**: Indicates whether html minification is enabled. default value is `false`. [detailed configuration reference...](https://github.com/jantimon/html-webpack-plugin#minification)
  - **optimizeCssAssetsPlugin**: Indicates that css minification config object. [detailed configuration reference...](https://github.com/NMFR/optimize-css-assets-webpack-plugin)
- **tmpl**: backend template preview mode. **note：the mode only works on `isTmpl: true`**
  - **port**: server port. default value is `3100`.
  - **autoOpen**: Indicates whether the browser is opened automatically. default value is `true`.
  - **qrcode**: Indicates whether the qrcode is generated automatically. default value is `true`.
- **preview**: preview mode.
  - **port**: server port. default value is `3030`.
  - **autoOpen**: Indicates whether the browser is opened automatically. default value is `true`.
  - **qrcode**: Indicates whether the qrcode is generated automatically. default value is `true`.

### Usage in project by `create-fes` command

- dev

```js
npm start
```

- build

```js
npm run build
```

- preview

```js
npm run preview
```

- template preview

```js
npm run tmpl
```

### css modules

_Note: The `global` mode is enabled by default. To use it, you need to declare `local` actively._

- scss
```scss
/* scss filename：_cssm.scss */
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

### Way of referring to pictures

_Note: The reference to the image must be relative to the entry page_

html: **relative path** is relative to the entry html file

```html
<img src="../assets/puppy.jpg" alt="">
<!-- require -->
<div style="background-image: url('${require(`../assets/puppy.jpg`)}')">
```
html: **absolute path**
```html
<!-- alias: @:/Users/singsong/github/fes/src -->
<img src="@/assets/puppy.jpg" alt="">
<div style="background-image: url('${require(`@/assets/puppy.jpg`)}')">
```
scss：**relative path** is relative to the entry css file

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

scss：**absolute path**

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

