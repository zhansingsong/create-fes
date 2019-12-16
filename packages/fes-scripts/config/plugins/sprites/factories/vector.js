const fs = require('fs');
const SVGSpriter = require('fes-svg-sprite');
const Promise = require('bluebird');
const _ = require('lodash');

/**
 * Generate the spritesheet.
 * @param  {Object} opts
 * @param  {Array}  images
 * @return {Promise}
 */
module.exports = function run(opts, images) {
  const config = _.defaultsDeep({}, opts.svgsprite);
  const spriter = new SVGSpriter(config);

  images.forEach(({ path }) => {
    spriter.add(path, null, fs.readFileSync(path, { encoding: 'utf-8' }));
  });

  return Promise.promisify(spriter.compile, {
    context: spriter,
    multiArgs: true,
  })().spread((result, data) => {
    const spritesheet = {};

    spritesheet.extension = 'svg';
    spritesheet.coordinates = {};
    spritesheet.image = result.stack.sprite.contents;
    spritesheet.properties = {
      width: data.stack.spriteWidth,
      height: data.stack.spriteHeight,
    };

    // svg 输出路径
    spritesheet.svgPath = config.mode.stack.sprite;

    data.stack.shapes.forEach((shape) => {
      spritesheet.coordinates[shape.name] = {
        usage: `${data.stack.sprite}#${shape.name}`,
        isStack: true,
        width: shape.width.outer,
        height: shape.height.outer,
      };
    });

    return spritesheet;
  });
};
