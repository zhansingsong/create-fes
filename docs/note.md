## 为什么不用[template]-loader
为优化，webpack loader在输出时，一般都是一个js-runtime字符串。而js-runtime对`html-loader`不是很友好，特别对一些结构完全与html结构不相似的 template engine。如`pug`。如果不使用`html-loader`可以忽略。但在实际开发过程，在html中直接插入图片或其他资源还是个很常用的需求。

要解决这个问题，需要对loader做一些定制。loader在输出最好是编译好的html，这样对下游`html-loader`处理就很友好了。同时，这样也方便对mock数据的处理。


