# CREATE-FES

![logo](./media/logo.png)

Set up a modern multiple-page app by running one command. inspired by [create-react-app](https://github.com/facebook/create-react-app).

[中文文档](./README.md)

## install
```js
npm install create-fes -g
```
If you don't install globally or locally, just do use `npx` command.(Recommand)
```js
npx create-fes <project-name>
```

## usage
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
