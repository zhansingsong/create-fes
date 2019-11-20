/**
 * @file css
 * @author junmer
 */

/* eslint-env node */
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const isTtf = require('is-ttf');
const through = require('through2');
const replaceExt = require('replace-ext');
const { b2a } = require('b3b');

/**
 * tpl
 *
 * @type {string}
 */
const tpl = fs.readFileSync(
  path.resolve(__dirname, './fontface.tpl')
).toString('utf-8');

/**
 * renderCss
 *
 * @type {function}
 */
const renderCss = _.template(tpl);


/**
 * listUnicode
 *
 * @param  {Array} unicode unicode
 * @return {string}         unicode string
 */
function listUnicode(unicode) {
  return unicode.map(u => `\\${u.toString(16)}`).join(',');
}

/**
 * get glyf list from ttf obj
 *
 * @param {ttfObject} ttf ttfObject
 * @return {Object} icon obj
 */
function getGlyfList(ttf) {
  const glyfList = [];

  // exclude empty glyf
  const filtered = ttf.glyf.filter(g => g.name !== '.notdef'
            && g.name !== '.null'
            && g.name !== 'nonmarkingreturn'
            && g.unicode && g.unicode.length);

  // format glyf info
  filtered.forEach((g) => {
    glyfList.push({
      code: `&#x${g.unicode[0].toString(16)};`,
      codeName: listUnicode(g.unicode),
      name: g.name || `uni${g.unicode[0].toString(16)}`,
    });
  });

  return {
    glyfList,
  };
}

/**
 * get font family name
 *
 * @param {Object} fontInfo font info object
 * @param {ttfObject} ttf ttfObject
 * @param {Object} opts opts
 * @return {string} font family name
 */
function getFontFamily(fontInfo, ttf, opts) {
  let { fontFamily } = opts;
  // Call transform function
  if (typeof fontFamily === 'function') {
    fontFamily = fontFamily(_.cloneDeep(fontInfo), ttf);
  }
  return fontFamily || ttf.name.fontFamily || fontInfo.fontFile;
}

/**
 * Transform font family name
 * @callback FontFamilyTransform
 * @param {Object} font info object
 * @param {ttfObject} ttf ttfObject
 * @return {string} font family name
 */
// function(fontInfo, ttfObject) { return "Font Name"; }

/**
 * css fontmin plugin
 *
 * @param {Object} opts opts
 * @param {boolean=} opts.glyph     generate class for each glyph. default = false
 * @param {boolean=} opts.base64    inject base64
 * @param {string=} opts.iconPrefix icon prefix
 * @param {(string|FontFamilyTransform)=} opts.fontFamily fontFamily
 * @return {Object} stream.Transform instance
 * @api public
 */
module.exports = function (opts) {
  opts = opts || {};

  return through.ctor({
    objectMode: true,
  }, function (file, enc, cb) {
    // check null
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    // check stream
    if (file.isStream()) {
      cb(new Error('Streaming is not supported'));
      return;
    }

    // check ttf
    if (!isTtf(file.contents)) {
      cb(null, file);
      return;
    }

    // clone
    this.push(file.clone(false));

    file.path = replaceExt(file.path, '.css');
    const fontFile = path.basename(file.path, '.css');

    // font data
    const fontInfo = {
      fontFile,
      fontPath: '',
      base64: '',
      glyph: false,
      iconPrefix: 'icon',
      local: false,
      output: false,
      fileName: false,
    };

    // opts
    _.extend(fontInfo, opts);

    // ttf obj
    const ttfObject = file.ttfObject || {
      name: {},
    };

    // glyph
    if (opts.glyph && ttfObject.glyf) {
      _.extend(
        fontInfo,
        getGlyfList(ttfObject)
      );
    }

    // font family
    fontInfo.fontFamily = getFontFamily(fontInfo, ttfObject, opts);

    // rewrite font family as filename
    if (opts.asFileName) {
      fontInfo.fontFamily = fontFile;
    }

    // base64
    if (opts.base64) {
      fontInfo.base64 = `${''
                + 'data:application/x-font-ttf;charset=utf-8;base64,'}${
        b2a(file.contents)}`;
    }

    // local
    if (fontInfo.local === true) {
      fontInfo.local = fontInfo.fontFamily;
    }

    // render
    const output = _.attempt(data => Buffer.from(renderCss(Object.assign({}, data, { timestamp: +new Date() }))), fontInfo);
    // 写入文件
    let outputPath = fontInfo.output;
    if (outputPath) {
      const fileName = opts.fileName ? opts.fileName : fontFile;
      if (!path.isAbsolute(outputPath)) {
        outputPath = path.join(__dirname, outputPath, `_${fileName}.scss`);
      } else {
        outputPath = path.join(outputPath, `_${fileName}.scss`);
      }
      console.log(outputPath, output, fs.existsSync(outputPath));
      fs.writeFile(outputPath, output);
    }

    if (_.isError(output)) {
      cb(output, file);
    } else if (outputPath) {
      cb(null);
    } else {
      file.contents = output;
      cb(null, file);
    }
  });
};
