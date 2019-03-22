/* eslint-disable */
const Spritesmith = require('spritesmith');
const Promise = require('bluebird');
const _ = require('lodash');

/**
 * Generate the spritesheet.
 * @param  {Object} opts
 * @param  {Array}  images
 * @return {Promise}
 */
module.exports = function run(opts, images) {
	const config = _.defaultsDeep({}, {
		src: _.map(images, 'path')
	}, opts.spritesmith);

	// Increase padding to handle retina ratio
	if (areRetinaImages(images)) {
		const ratio = _.chain(images)
			.flatten('ratio')
			.uniq()
			.head()
			.value()
			.ratio;

		if (ratio) {
			config.padding = config.padding * ratio;
		}
	}

	return Promise.promisify(Spritesmith.run, { context: Spritesmith })(config)
		.then((spritesheet) => {
			spritesheet.extension = 'png';

			return spritesheet;
		});
}

/**
 * Checkes whether all images are retina.
 * @param  {Array} images
 * @return {Boolean}
 */
function areRetinaImages(images) {
	return _.every(images, image => image.retina);
}
