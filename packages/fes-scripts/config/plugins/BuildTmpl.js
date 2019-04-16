const glob = require('glob');
const {
  join, parse, relative,
} = require('path');
const fse = require('fs-extra');

// Note: the fileDependencies array is rebuilt in each compilation,
// so your plugin must push its own watched dependencies into each
// compilation to keep them under watch.
/* eslint-disable func-names */
function BuildTmpl(options) {
  this.options = options;
}
BuildTmpl.prototype.apply = function (compiler) {
  const headRegExp = /(<\/head\s*>)/i;
  const bodyRegExp = /(<\/body\s*>)/i;
  const requireRegExp = /\$\{require\(\`([^`]*)\`\)\}/g; // eslint-disable-line

  function genreateLinks(links) {
    let linkStr = Object.values(links).reduce(
      (result, currentLink) => `${result}<link rel="stylesheet" href="${currentLink}">`,
      ''
    );
    linkStr += '{% block link %}{% endblock %}';
    return linkStr;
  }
  function insertLinks(manifest, metas) {
    const { cssFiles } = manifest;
    const key = `${metas.name}.css`;
    return cssFiles[key]
      ? `{% block link %}<link rel="stylesheet" href="${cssFiles[key]}">{% endblock %}`
      : '';
  }

  function mediaMapAsset(manifest, media) {
    const values = Object.values(media);
    const { assets } = manifest;
    const assetsKeys = Object.keys(assets);
    const result = {};
    values.forEach((item) => {
      const metas = parse(item);
      const filter = assetsKeys.filter(key => metas.base === parse(key).base);
      result[item] = assets[filter[0]];
    });
    return result;
  }

  function handleAssets(content, manifest, media) {
    const mediaMapAssetObj = mediaMapAsset(manifest, media);
    // console.log(mediaMapAssetObj);
    const keys = media;
    keys.forEach((key) => {
      content = content.replace(RegExp(key, 'g'), mediaMapAssetObj[key]); // eslint-disable-line
    });
    return content;
  }

  function insertSript(manifest, metas) {
    const { scriptFiles } = manifest;
    const key = `${metas.name}.js`;
    return scriptFiles[key]
      ? `{% block script %}<script src="${scriptFiles[key]}"></script>{% endblock %}`
      : '';
  }

  function getEntry(manifest) {
    const { htmlFiles } = manifest;
    return Object.keys(htmlFiles).map(item => parse(item).name);
  }

  function outputTmpl(content, metas) {
    fse.outputFileSync(
      relative(
        join(process.cwd()),
        `${metas.dir.replace('/src/views', '/build/tmpl')}/${metas.base}`
      ),
      content
    );
  }

  function genreateScripts(scripts) {
    let keys = Object.keys(scripts);
    if (keys[0] !== 'vendors.js') {
      keys = keys.reverse();
    }
    const scriptStr = keys.reduce(
      (result, currentKey) => `${result}<script src="${scripts[currentKey]}"></script>`,
      ''
    );
    return `${scriptStr}{% block script %}{% endblock %}`;
  }

  compiler.hooks.afterEmit.tapAsync('BuildTmpl', (compilation, callback) => {
    const manifest = require(join(process.cwd(), 'build', 'asset-manifest.json')); // eslint-disable-line
    const media = this.options.sharedData.mediaSource || {};
    const entry = getEntry(manifest);
    const files = glob.sync(join(process.cwd(), 'src/views/**/**.html'), {});
    files.forEach((f) => {
      // normalize解决Windows下路径分隔符bug
      // const normalizeFile = normalize(f);
      const metas = parse(f);
      let fileContent = '';
      fileContent = fse.readFileSync(f, 'utf8');

      fileContent = fileContent.replace(requireRegExp, (match, $1) => $1);
      if (metas.name === 'layout') {
        // fileContent = fileContent.replace(headRegExp, match => genreateLinks({...manifest.commonCss, ...manifest.cssFiles}) + match);
        fileContent = fileContent.replace(
          headRegExp,
          match => genreateLinks(manifest.commonCss) + match
        );
        fileContent = fileContent.replace(
          bodyRegExp,
          match => genreateScripts(manifest.commonScripts) + match
        );
      }
      if (entry.indexOf(metas.name) > -1) {
        fileContent += insertLinks(manifest, metas);
        fileContent += insertSript(manifest, metas);
      }
      fileContent = handleAssets(fileContent, manifest, media);
      outputTmpl(fileContent, metas);
    });

    callback(null);
  });
};

module.exports = BuildTmpl;
