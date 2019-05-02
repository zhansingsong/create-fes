## 为什么不用[template]-loader
为优化，webpack loader在输出时，一般都是一个js-runtime字符串。而js-runtime对`html-loader`不是很友好，特别对一些结构完全与html结构不相似的 template engine。如`pug`。如果不使用`html-loader`可以忽略。但在实际开发过程，在html中直接插入图片或其他资源还是个很常用的需求。

要解决这个问题，需要对loader做一些定制。loader在输出最好是编译好的html，这样对下游`html-loader`处理就很友好了。同时，这样也方便对mock数据的处理。


## css 热加载
之前 webpack 支持 css 热加载，一直由 sytle-loader 来完成。由于 style-loader 是由 js 将 css 添加到 DOM 中，这样会导致 FOUC(flash of unstyled content) 问题。为了避免 FOUC，可以使用 [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)，但是 mini-css-extract-plugin 不支持 hmr，不过可以配合 [css-hot-loader](https://github.com/shepherdwind/css-hot-loader) 让其支持 hmr。

[mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) 在 0.0.6 开始支持 hmr。
```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // only enable hot in development
              hmr: process.env.NODE_ENV === 'development',
              // if hmr does not work, this is a forceful method.
              reloadAll: true,
            },
          },
          'css-loader',
        ],
      },
    ],
  },
};
```

## 去掉[postcss-modules](https://github.com/css-modules/postcss-modules)使用css-loader的css modules使用css
之前使用postcss-moudles，主要解决将经过css-modules编译后的类名对象与模板变量数据合并作为模板渲染数据。这种模式对当前的开发场景来说不如将在js中使用灵活。
>  尝试：将css-modules与模板数据结合在一起也算一种新尝试，可以制定一定规范，只要所有整个模板都遵循这一套规范也是一种新的开发方式。
