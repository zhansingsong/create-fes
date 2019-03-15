# 代码规范化工具 ESLint

在将 ESLint 集成到自己的开发环境中时，发现对 ESLint 的了解有点模糊。于是就写了这篇文章，记录一下 ESLint 一般使用。

## ESLint

> ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code, with the goal of making code more consistent and avoiding bugs —— ESLint official website

ESLint 是一个基于 ECMAScript/JavaScript 代码模式识别和报告的工具，用于确保代码的一致性和正确性。

## 安装和使用

>前提条件：Node.js >= 6.14，npm 3+.

ESLint 支持两种安装方式：全局安装和本地安装。

### 本地安装和使用

如果想将 ESLint 作为项目构建框架的一部分，推荐本地安装。

```js
npm install eslint --save-dev
```
初始化 ESLint，创建一个 ESLint 配置文件
```js
./node_modules/.bin/eslint --init
```
运行 ESLint 检测代码
```js
./node_modules/.bin/eslint yourfile.js
```
另外，也可以使用 [npx](https://www.npmjs.com/package/npx)。
```js
npx eslint yourfile.js
```
### 全局安装和使用

如果不想在每个项目都单独安装 ESLint，又希望每个项目都能使用 ESLint。可以将 ESLint 安装在全局环境中。

```js
npm install -g eslint
```
初始化 ESLint，并创建一个 ESLint 配置文件。
```js
eslint --init
```
运行 ESLint 检测代码
```js
eslint yourfile.js
```

**注意：** ESLint 的任何插件或共享配置文件必须与 ESLint 安装环境保持一致。即如果 ESLint 是本地安装（或全局安装），相关的插件和共享配置文件也要相应地安装在本地（或全局）。如果混合安装可能导致 ESLint 不能正常工作，这与 Node 模块查询机制有关。

## ESLint 配置

在运行 `eslint --init` 后，在当前目录会新创建一个 `.eslintrc` 配置文件。假如文件内容如下所示
```json
{
    "rules": {
        "eqeqeq": "off",
        "semi": 0,
        "quotes": ["error", "double"],
    }
}
```
`"semi"` 和 `"quotes"` 是 ESLint 的规则名，取值可以是下面任何一个值：

- `"off"` 或 `0`：关闭规则。
- `"warn"` 或 `1`：开启规则。如果规则匹配会提示警告，但不会退出当前进程。
- `"error"` 或 `2`：开启规则。如果规则匹配会报错，并退出当前进程。
当规则提供了额外的配置选项，就需要使用数组形式使用。如 `"quotes": ["error", "double"]`，数组第一个元素永远是规则的取值（`"error"`），其他元素则是该规则特有的配置选项（`"double"`）。

除了可以在配置文件中定制规则外，还可以通过如下方式
- 注释方式定制：
  ```js
  /* eslint eqeqeq: "off", curly: "error" */
  ```
  或
  ```js
  /* eslint eqeqeq: 0, curly: 2 */
  ```
  上述两种方式完全对等。如果需要定制额外配置选项：

  ```js
  /* eslint quotes: ["error", "double"], curly: 2 */
  ```
- `package.json`
  ```js
  {
      "name": "mypackage",
      "version": "0.0.1",
      "eslintConfig": {
          "rules": {
              "eqeqeq": "off",
              "curly": "error",
              "quotes": ["error", "double"]
          }
      }
  }
  ```


ESLint 配置文件支持如下格式：

- JavaScript
- YAML
- JSON
- package.json

如果在同一个目录同时存在多个配置文件，ESLint 会按如下优先级使用优先级高者。

1. .eslintrc.js
2. .eslintrc.yaml
3. .eslintrc.yml
4. .eslintrc.json
5. .eslintrc(格式为JSON/YAML)
6. package.json

### 配置的叠层关系
假如有个 app，目录结构如下所示：

```
├─┬ app
  ├── .eslintrc
  ├── lib
  │ └── source.js
  └─┬ tests
    ├── .eslintrc
    └── test.js
```
`app/.eslintrc` 配置文件会作用 `app/` 下的所有文件。其中 `app/tests/test.js` 由 `app/tests/.eslintrc` 和 `app/.eslintrc` 共同作用，而 `app/tests/.eslintrc` 的优先级较高。

ESLint 默认情况下会从当前的目录逐级向上查找配置文件，直到用户根目录为止。这对于想要将所有项目都统一遵循一套代码风格是很有益处的，只需在用户根目录下添加一个配置文件即可（`~/.eslintrc`）。但有时可能又不想要这种行为，为了将 ESLint 限制在特定的项目中，可以在配置文件中添加`"root": true`即可。这样 ESLint 在寻找配置文件时，如果发现配置文件中存在该配置项，就不会再继续向上查找了。

假如有个 projectA 项目。目录结构如下：
```js
home
└── user
    ├── .eslintrc <- Always skipped if other configs present
    └── projectA
        ├── .eslintrc  <- Not used
        └── lib
            ├── .eslintrc  <- { "root": true }
            └── main.js
```
这里对 `projectA/lib/.eslintrc` 设置了 `"root": true` 配置项。这样在 ESLint 分析 `projectA/lib/main.js` 时，仅仅 `projectA/lib/.eslintrc` 配置文件生效，而 `projectA/.eslintrc` 是没作用的。[更多……](https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy)


### `plugins`

如果需要定制的规则来自第三方插件，首先需要先配置插件。在配置时需要将插件名中的 `eslint-plugin-` 前缀去掉。

```js
{
    "plugins": [
        "plugin1" // 插件 eslint-plugin-plugin1
    ]
}
```

然后再定制插件规则。这里需要以 `插件名/规则名` 形式作为定制规则名，同样也需要将插件名中的 `eslint-plugin-` 前缀去掉。因为 ESLint 在定位规则插件时，只会使用无前缀的插件名进行匹配。
```js
{
    "plugins": [
        "plugin1" // 插件 eslint-plugin-plugin1
    ],
    "rules": {
        "plugin1/rule1": "error"
    }
}
```
或者

```js
/* eslint "plugin1/rule1": "error" */
```
### 关闭规则

ESLint 提供了多种关闭规则的方式。

- 注释方式
  ```js
  /* eslint-disable */

  alert('foo');

  /* eslint-enable */
  ```
  ```js
  /* eslint-disable no-alert */

  alert('foo');

  /* eslint-enable no-alert */
  ```
  ```js
  alert('foo'); // eslint-disable-line

  // eslint-disable-next-line
  alert('foo');

  /* eslint-disable-next-line */
  alert('foo');

  alert('foo'); /* eslint-disable-line */
  ```

  ```js
  alert('foo'); // eslint-disable-line no-alert

  // eslint-disable-next-line no-alert
  alert('foo');

  alert('foo'); /* eslint-disable-line no-alert */

  /* eslint-disable-next-line no-alert */
  alert('foo');
  ```
- `.eslintrc` 配置文件

  ```js
  {
      "rules": {
          "no-alert": "off",
      }
  }
  ```
- `package.json`
  ```js
  {
      "name": "mypackage",
      "version": "0.0.1",
      "eslintConfig": {
          "rules": {
            "no-alert": "off",
          }
      }
  }
  ```

- 关闭特定文件的规则

  ```js
  {
    "rules": {...},
    "overrides": [
      {
        "files": ["*-test.js","*.spec.js"], // 指定需要关闭规则的文件
        "rules": {
          "no-unused-expressions": "off" // 关闭的规则
        }
      }
    ]
  }
  ```

- 关闭插件 `eslint-plugin-example` 的 `rule-name` 规则

  ```js
  foo(); // eslint-disable-line example/rule-name
  foo(); /* eslint-disable-line example/rule-name */
  ```


### `Parser`

ESLint 默认只会处理 ECMAScript 5。如果需要支持其他 ECMAScript 版本，可以通过 `parserOptions` 选项来指定。

```js
{
    "parserOptions": {
        "ecmaVersion": 6, // 指定 ECMAScript 版本。如3, 5(默认), 6(2015), 7(2016), 8(2017), 9(2018), or 10(2019)
        "sourceType": "module", // 指定源码类型。该规则指定使用 ECMAScript modules。默认为 `script`
        "ecmaFeatures": {
            "jsx": true, // 开启 JSX，默认 false
            "globalReturn": true, // 允许在全局作用域下存在 return 语句。默认 false
            "impliedStrict": true, // 如果 ecmaVersion >= 5，开启严格模式。默认 false
        }
    },
}
```

### `env`

如果想要使用 ES6 的 `Set`、`Map`，就需要指定 `es6` 执行环境。ESLint 提供了很多常见的执行环境：
- browser
- node
- commonjs
- es6
- amd
- [更多......](https://eslint.org/docs/user-guide/configuring#specifying-environments)

```js
{
    "env": {
        "es6": true, // 除了 modules 外，es6 环境
        "browser": true, // 浏览器 window
        "node": true // Node 环境
    }
}
```
使用第三方插件提供的执行环境：
```js
{
    "plugins": ["example"], // example 插件
    "env": {
        "example/custom": true
    }
}
```
### global

如果访问没有被定义的全局变量，[no-undef](https://eslint.org/docs/rules/no-undef) 规则就会警告它们的使用。此时可以通过如下方式解决：
```js
{
    "globals": {
        "var1": "writable", // var1 可以读写
        "var2": "readonly" // var2 仅可读
        "var3": "off" // var3 不可读写
    }
}
```
或
```js
/* global var1:writable, var2, var3: off*/
```
由于历史原因，如下对 `var1`、`var2` 的设置效果完全相同。
```js
"var1": "writable",
"var1": "writeable",
"var1": true,
```
```js
"var2": "readonly",
"var2": "readable",
"var2": false,
```
### `extends`

如果不知道怎么定制一套属于自己的代码风格，可以基于一些现有的代码风格进行定制。

- [Airbnb](https://github.com/airbnb/javascript) 
- [recommended](https://github.com/kunalgolani/eslint-config) 
- [Standard](https://github.com/standard/standard) 
- [Google](https://github.com/google/eslint-config-google) 

扩展主流的代码风格

```js
{
    "extends": [
        "eslint:Airbnb",
    ],
}
```
使用 `rules` 配置项定制专属代码风格
```js
{
    "extends": [
        "Airbnb",
    ],
    "rules": {
        // enable additional rules
        "indent": ["error", 4],
        "eqeqeq": "warn",

        // override default options for rules from base configurations
        "quotes": ["error", "single"],

        // disable rules from base configurations
        "no-console": "off",
    }
}
```
`rules` 选项可能会继承或重写 `extends` 规则：

- 继承规则

  - `extends` 规则：`"eqeqeq": ["error", "allow-null"]`
  - `rules` 规则： `"eqeqeq": "warn"`
  - 最终规则：`"eqeqeq": ["warn", "allow-null"]`

- 重写规则

  - `extends` 规则：`"quotes": ["error", "single", "avoid-escape"]`
  - `rules` 规则： `"quotes": ["error", "single"]`
  - 最终规则：`"quotes": ["error", "single"]`

**扩展来自第三方插件的代码风格**
```js
{
    "plugins": [
        "react"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended" // react 插件的 recommended
    ],
    "rules": {
       "no-set-state": "off"
    }
}
```

### `.eslintignore`

可能存在希望 ESLint 在工作时，忽略掉特定文件或目录。此时可以在项目根目录创建一个 `.eslintignore` 文件，然后在文件添加需要忽略掉的文件或目录即可。ESLint 默认会忽略掉`/node_modules/*` 和 `/bower_components/*`。
```bash
# /node_modules/* and /bower_components/* in the project root are ignored by default

# Ignore built files except build/index.js
build/*
!build/index.js # negated pattern
```
> singsong: 如果是 Monorepos，需要明确指定 `packages/node_modules` 。

在 `package.json` 中配置

```js
{
  "name": "mypackage",
  "version": "0.0.1",
  "eslintConfig": {
      "env": {
          "browser": true,
          "node": true
      }
  },
  "eslintIgnore": ["build/*", "!build/index.js"]
}
```

ESLint 在执行后，如果存在错误或警告。可以在 ESLint 执行时增加 `--fix` 选项来自动修复。但并不是所有错误或警告都能修复。只有规则前有个 🔧 才能被修复，[更多……](https://eslint.org/docs/rules/)

## ESLint + IDE

这里以 [Visual Studio Code](https://code.visualstudio.com/) 为例讲解，其他可以参考[官方相关介绍](https://eslint.org/docs/user-guide/integrations)。

要将 ESLint 集成到 Visual Studio Code 中，需要依赖 [vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) 插件。集成步骤如下：

- 安装 ESLint(全局或本地)
- 安装 [vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) 插件
- 创建 `.eslintrc.*` 配置文件

如果不想手动修复 ESLint 报出的错误，可以配合格式化工具自动修复（只能修复规则前有个 🔧 的规则，其他错误还需手动修复）。这里以 [prettier](https://github.com/prettier/prettier) 为例。

- 安装 vscode 插件 [prettier-vscode](https://github.com/prettier/prettier-vscode)

