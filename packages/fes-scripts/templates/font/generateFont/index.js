const fs = require('fs');
const Fontmin = require('fontmin');
const css = require('./plugins/css');
const { fileName, fontFamily, text } = require('../font.config');

const jsFileString = `/* eslint-disable */ var fes_font_text=${JSON.stringify(text)}; var fes_fontFamily="${fontFamily}";`;
fs.writeFileSync('preview/preview.js', jsFileString);

const isPublic = process.argv[2] === 'public';
const fontmin = new Fontmin().src('./*.ttf');

const config = {
  fontPath: './', // location of font file
  base64: true, // inject base64 data:application/x-font-ttf; (gzip font with css).  default = false
  glyph: false, // generate class for each glyph. default = false
  iconPrefix: 'my-icon', // class prefix, only work when glyph is `true`. default to "icon"
  fontFamily, // custom fontFamily, default to filename or get from analysed ttf file
  asFileName: false, // rewrite fontFamily as filename force. default = false
  local: true, // boolean to add local font. default = false
};

if (isPublic) {
  config.fontPath = '~@/assets/iconfont/';
  config.output = '../../src/styles/lib/';
  config.fileName = fileName;
}

fontmin
  .use(
    Fontmin.glyph({
      trim: false,
      text: text || '#',
      hinting: false, // keep ttf hint info (fpgm, prep, cvt). default = true
    })
  )
  .use(Fontmin.ttf2eot())
  .use(
    Fontmin.ttf2woff({
      deflate: true, // deflate woff. default = false
    })
  )
  .use(Fontmin.ttf2svg())
  .use(css(config));

if (isPublic) {
  fontmin.dest('../src/assets/iconfont/');
} else {
  fontmin.dest('./build');
}

fontmin.run((err, files) => { // eslint-disable-line
  if (err) {
    throw err;
  }
});
