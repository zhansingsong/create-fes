# 为什么我构建这个脚手架

本文不是什么技术性介绍文章，准确地说算是自己的成长记录吧。刚参加工作时，组里使用的脚手架是由 leader 使用 webpack, gulp 搭建的 fex。当时只需知道怎么使用就行了，不过为了能更好地工作，对 fex 怎么构建一直很好奇，也一直关注相关的技术栈。经过一年多磨练后，对 fex 的怎么搭建有了个大概认识。不过常言道："没有对比就没有伤害"。 在使用 vue-cli 构建第一个 vue 项目后，对脚手架构建有了个全新的认识。发现 fex 存在很多不足：

- 在打包时，只对 JavaScript 和 CSS 脚本文件进行打包压缩处理。不能对资源文件（如 img，字体等）进行依赖处理。导致在打包时：
  - 不能按需打包（即实际用到资源，才将其进行打包）
  - 不能进行 MD5 处理
  - 不能输出压缩版的 html
- 手动注入 JavaScript 和 CSS 脚本文件，如果需要做优化，会很不方便，特别在多页面情况下。
- dev 与 build 使用不同的技术方案，增加定制的成本。
- 基于 nodemon 对开发目录进行 watch，当执行修改操作时，会重启整个服务。会导致有时重启耗时比较长，刷新页面会出现空页面的情况，开发体验不是很好。
- 缺少 code-splitting、HMR、端口检测、Babel 等功能。

当然，fex 也有自己的优点。基于自建服务提供前后端复用模板功能。前端后端使用相同的模板语言，前端拼接的模板可以直接输出给后端使用。

第二年年初，组里项目不是太多，刚好有时间折腾一下，于是决定构建一个新的脚手架 fes。为了尝试一些新东西，在技术栈上，都使用了当时最新的技术框架 webpack4、koa2、babel6 来搭建。但为了了解 webpack 如何工作，对 webpack 就做了 8 次调试，才稍微对 webpack 整个架构有个初步认识。还对 koa2、babel6 做了相关的研究。为了能将 fes 体验做到更好，除了继承 fex 的模板复用功能外，还集成了 vue-cli 中不错的功能。

- 兼容 macOS、windows、Linux 等操作系统。同时兼容主流浏览器及 IE 低版本
- ES6、SASS
- js-code-splitting、css-code-splitting
- 多页面开发环境
- proxy
- css autoprefixer
- css/svg sprite
- 支持更灵活定制，如是否自动打开浏览器、热加载等配置
- 自动监听 port，如果被占用，提示性切换
- 打包优化分析
- 模板输出(便于后端复用模板)
- 基于[mockjs](https://github.com/nuysoft/Mock/wiki/Getting-Started) 模拟 api

在搭建 fes 过程，自己对前端代码规范化的重要性有了自己的一些思考：

> 前端开发的规范如 JavaScript 特性一样：弱类型，没有统一规范，每个人都有自己一套编码风格。这对团队来说并不是一件什么好事。团队中大多数的项目（前端）都是由个人来维护，很少有团队合作的项目。因为每个人编码风格不同，导致下个接手维护的人需要重新习惯这种编码风格。这就存在一定的学习成本，而且效率不高。可能原维护人只需花几分钟解决的事，接手人需要花几个小时，甚至更多的时间和精力。对团队合作项目来说，统一的编码风格显得更为重要。因为不同的编码风格会让团体开发进度大打折扣，维护起来也很费力。另外，开发人员会对彼此编码习惯存在不同程度的排斥现象。
>
>项目规范化的辅助性工具：
>
>- eslint：规范 js 代码
>- stylelint：规范 css 代码
>- editorconfig：规范 IDE
>- husky 和 lint-staged：在 pre-commit 时 eslint、stylelint，确保风格一致的高质量的代码输出。
>
>规范化的好处：
>
>- 规范化统一团队的编码风格，便于团队内项目的维护。
>- 规范化可以让开发规避一些常见的错误。如未使用的变量；文件命名错误，未能成功导入等。
>- 规范化对新人有很好的指导作用，好的开始很重要。因为这些规范都是行业内一些最佳实践，可新人成长得更加专业化。

为了能将规范化在组内推广，作为一种开发习惯。所以也将 eslint、stylelint、prettier、husky、lint-staged 集成到 fes 中。

当然整个 fes 搭建过程中也并不是一帆风顺的，途中也遇见一些坑：

- koa2 与 html-webpack-plugin

在开发模式下，fes 是基于 html-webpack-plugin 插件自动生成 HTML 文件，而 html-webpack-plugin 插件合成的 html 缓存在内存中，为了配合 koa2 输出合成的 html 文件，需要将 html 文件写入磁盘中。而要将 html-webpack-plugin 合成的 html 文件输出到磁盘中，需要借助 html-webpack-harddisk-plugin 插件。html-webpack-harddisk-plugin 是个基于 html-webpack-plugin 的插件。

- html 中 img 的解析

webpack 对 html 的解析不是很友好的。虽然 webpack 提供了 html-loader 来解析 html 中的 img。但 html-loader 是基于字符正则匹配来解析，即解析的是 html 文件。但 fes 使用的是模板文件，这就需要对应模板 loader。而 webpack 对 loader 的实现制定了相关的规范，为了提高编译性能，loader 一般返回的是一个 runtime 字符串，而不是最终编译后的输出。这样不仅有效地避免每次重新生成，也方便共享。所以为了能让 html-loader 解析模板文件，需要对模板 loader 做些定制，将其输出由 runtime 变为最终输出编译结果。

- 对 twig 模板 `include` 文件修改，重编译不生效

开启 `twig.cache(false)`，也不能解决这个问题。经查阅 twig.js 源码后，需要通过`twig.extend`扩展，对缓存对象进行初始化，来禁掉缓存。

```js
// 去掉缓存
Twig.extend(T => {
  if (T.Templates && T.Templates.registry) {
    T.Templates.registry = {};
  }
});
```

- postcss-sprites 不支持 webpack 的 alias

因为 postcss-sprites 是 postcss 的插件，独立于 webpack。要让 postcss-sprites 支持 alias，只能扩展 postcss-sprites 让其支持与 webpack 一样的 alias 配置项。需要在遍历样式节点时，根据 alias 配置项替换，换成真实数据。

```js
const replaceAlias = image => {
  const {alias} = opts;
  let {url, originalUrl} = image;
  const tempUrl = url;
  if (/^~/.test(url)) {
    Object.keys(alias).forEach(item => {
      url = url.replace(RegExp('^~' + item), alias[item]);
      if (url !== tempUrl) {
        originalUrl = path.relative(path.parse(styleFilePath).dir, url);
        url = originalUrl;
        // 替换源码
        rule.replaceValues(tempUrl, {fast: tempUrl}, s => url);
      }
    });
  }
  image.url = url;
  image.originalUrl = originalUrl;
  return image;
};
```

- 模板复用

fes 是基于 webpack-html-plugin 插件自动生成合成的 html 文件。但为了提供工作效率，业务中存在对模板复用的需求，所以需要重新定制输出。

> 思路：通过 webpack-manifest-plugin 输出资源清单 manifest，再根据 manifest 将资源注入到模板中。另外，为了方便替换 html 中的图片资源，还需要将 html-loader 解析结果作为依赖替换。

```json
{
  "commonScripts": {
    "common.js": "/static/js/common.486cb059.chunk.js",
    "vendors.js": "/static/js/vendors.11aa87af.chunk.js"
  },
  "commonCss": {
    "common.css": "/static/media/common.6094b30a.css"
  },
  "scriptFiles": {
    "index.js": "/static/js/index.bc043de1.js",
    "home.js": "/static/js/home.d8768213.js",
    "about.js": "/static/js/about.a3e6551a.js"
  },
  "cssFiles": {},
  "assets": {
    "static/media/puppy.jpg": "/static/media/puppy.da5595d8.jpg",
    "static/media/ant2.png": "/static/media/ant2.89ca7b1b.png",
    "static/media/ant1.png": "/static/media/ant1.ed485ba9.png",
    "static/media/husky.jpg": "/static/media/husky.4063f14b.jpg"
  },
  "htmlFiles": {
    "about.html": "/about.html",
    "home.html": "/home.html",
    "index.html": "/index.html"
  }
}
```

大概经历一个半月的时间，fes 也如期而至。于是就在组里推广使用，自己也使用开发了几个项目。与 fex 相比，fes 在开发效率、体验上都得到很大的提升。但是也暴露一些问题，其中最头疼的问题是：由于没有将核心代码作为依赖包，导致在使用过程中，都是现场解决，然后在同步到代码库中。但这样不能很好地将代码同步其他已使用项目中。

所以在经过半年的使用后，决定对 fes 进行重构。并整理了需要优化的点：
- 优化热加载。
- 支持模板语言 loader 的配置。
- 支持 css 预处理 loader 的配置。
- 默认开启 stylelint、eslint、precommit。默认配置 vscode 工作环境。
- 支持模板可选。
- 引入 common.js，方便添加公用代码，避免每个 js 文件重复引用。
- 优化某些页面没有对应的 js 文件。
- proxy 配置不是很友好，需要优化。
- 去掉 jquery 中为默认内置。
- 支持路由配置。
- 支持多级目录结构。
- 将 media.json 放入 gitignore。
- 支持传统的打包方式，将所有的 js 文件打包到一个文件中。方便于简单的小项目。
- sprite 合成会引起一次编译，大多数情况这次编译是多余的。
- 可以将 start、tmpl、preview 脚本进行优化，提出共有逻辑，增加复用性，和可维护性。
- 支持 CSS-Modules。
- 支持 typeScript。
- 优化编译，打包时间。

不过在重构过程中，在是否将 Babel 内置于 fes 中有了一些新的思考 🤔。
> 在搭建 fes 初版时，只要是觉得不错的功能都集成于 fes 中，但并不是所有的项目都需要所有功能，而且这样会导致 fes 变得臃肿。也就是说有些可选功能，没必要作为内置功能。如果 babel、typeScript、stylelint、eslint、precommit 等。其实 fes 只需内置基础架构即可，其他可选功能可以通过配置来定制。这样不仅可让 fes 变得灵活轻巧，而且也方便扩展。这才是架构的精髓！


为了将 fes 的核心代码提取作为依赖包，参考了 [create-react-app](https://github.com/facebook/create-react-app) 构建。毕竟 create-react-app 是个明星项目，技术也相对稳定成熟。加上之前也使用 create-react-app 构建几个 react 项目，对其也算有点了解，不过只停留在使用上。如果要重构 fes 还需要对 create-react-app 源码深入研究一番。

整个 fes 的构建完全基于 create-react-app。代码结构也由两个 packages 组成：create-fes 和 fes-scripts。但对于如何维护这两个 packages 是一个很棘手的问题。如果独立管理开发起来不是很方便，后期维护成本也高（如版本号维护）。查看了 create-react-app 源码，发现在其源码中有个 `lerna.json` 文件。好奇这个文件是做什么的，就了解一番。经查阅了解到 [Lerna](https://github.com/lerna/lerna) 可以用来管理项目中多个 packages。这正是自己所需要的，为此自己也专门写了一篇 Lerna 文章：[monorepos by lerna](./Lerna-monorepos.md)。

架构图



- 动态响应mock api
- HMR(css-hot-loader)
- 模板laoder的重构,base,与前后端保持一致
- media.json sharedData 写入内存，提高编译速度
- 针对开发focus，提高编译速度


增加
- foolMode
- debug
