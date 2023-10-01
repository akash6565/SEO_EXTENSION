/**
 * SEO Insights
 * Copyright (C) 2021 Sebastian Brosch
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// create the namespace of SEO Insights if the namespace doesn't exist.
var SEOInsights = (SEOInsights || {});

/**
 * The Image class of SEO Insights to get information of images used on a website.
 */
SEOInsights.Image = class Image {

	/**
	 * Returns detailed information (source and filename) of the image source.
	 * @param {string} src The source of the image to get detailed information.
	 * @returns {object} An object with the source and the filename (if available).
	 */
	static getImageSource(src) {

		// if there is no image source or a data source the value can be returned.
		// there is no possibility to get a url object with advanced information.
		if (src.trim() === '' || src.startsWith('data:')) {
			return {
				filename: '',
				source: src,
			};
		}

		// try to get a url object with advanced information.
		try {

			// get the image source as url object to get the advanced information.
			// if there is no protocol, the current protocol of the website is used (relative protocol).
			const srcUrl = new URL(src, getBaseUrl());

			// ignore images of other extensions. chrome and edge use the same protocol.
			if (srcUrl.protocol === 'chrome-extension:') {
				return null;
			}

			// return the image url and filename of the image source.
			return {
				filename: srcUrl.href.substring(srcUrl, srcUrl.href.lastIndexOf('/') + 1),
				source: srcUrl.href,
			};
		} catch(_e) {
			return null;
		}
	}

	/**
	 * Returns all images of the specified context.
	 * @param {object} context The specified context to get all the images.
	 * @returns {Array<object>} An array with all found images of the specified context.
	 */
	static getImagesOfDocument(context = null) {
		const images = [];

		// get all <picture> and <img> element of the current context.
		$('picture, img', context).each(function() {
			const elementTagName = ($(this).prop('tagName') || '').toString().toLowerCase();

			// get the image information depending on the element.
			// it is possible to get some more information from <picture> element.
			if (elementTagName === 'picture') {
				const pictures = [];

				// get the sources and different images and sizes.
				$('source', $(this)).each(function() {
					const srcset = ($(this).attr('srcset') || '').toString().trim();
					const sources = srcset.split(/(?<=\d+w)[,]/);

					// iterate through the sources.
					for (const source of sources) {
						pictures.push({
							'src': SEOInsights.Image.getImageSource(source.split(/[ ](?=\d+w)/)[0]),
							'size': (source.split(/[ ](?=\d+w)/)[1] || '').toString().trim(),
						});
					}
				});

				// get the <img> element inside the <picture> element.
				$('img', $(this)).filter(function() {
					return (SEOInsights.Image.getImageSource(($(this).attr('src') || '').toString().trim()) !== null);
				}).each(function() {
					const source = SEOInsights.Image.getImageSource(($(this).attr('src') || '').toString().trim());

					// add the current image to the array.
					images.push({
						alt: ($(this).attr('alt') || '').toString().trim(),
						filename: source.filename,
						src: ($(this).attr('src') || '').toString().trim(),
						source: source.source,
						title: ($(this).attr('title') || '').toString().trim(),
						pictures: pictures,
					});
				});
			} else if (elementTagName === 'img') {
				const source = SEOInsights.Image.getImageSource(($(this).attr('src') || '').toString().trim());

				// ignore images without a source.
				if (source === null) {
					return;
				}

				// ignore all the <img> elements inside a <picture> element.
				if (($(this).parent().prop('tagName') || '').toString().toLowerCase() === 'picture') {
					return;
				}

				// add the current image to the array.
				images.push({
					alt: ($(this).attr('alt') || '').toString().trim(),
					filename: source.filename,
					src: ($(this).attr('src') || '').toString().trim(),
					source: source.source,
					title: ($(this).attr('title') || '').toString().trim(),
				});
			}
		});

		// return all found images.
		return images;
	}

	/**
	 * Returns all images of the current website.
	 * @returns {Array<object>} An array with all found images of the website.
	 */
	static getImages() {
		let images = SEOInsights.Image.getImagesOfDocument();

		// iterate through the frames of the page to get the images of the available frames.
		for (let frameIndex = 0; frameIndex < window.frames.length; frameIndex++) {

			// there are also blocked frames so we have to try to get the document of the frame.
			try {
				images = images.concat(SEOInsights.Image.getImagesOfDocument(window.frames[frameIndex].document));
			} catch(_e) {}
		}

		// return all found images of the website.
		return images;
	}

	/**
	 * Returns all icons of the current website.
	 * @returns {Array<object>} An array with all found icons of the website.
	 */
	static getIcons() {
		const icons = [];

		// iterate through all icons of the website header.
		$('head > link[rel*="icon"]').filter(function() {
			return (SEOInsights.Image.getImageSource(($(this).attr('href') || '').toString().trim()) !== null);
		}).each(function() {
			const source = SEOInsights.Image.getImageSource(($(this).attr('href') || '').toString().trim());

			// add the icon to the array.
			icons.push({
				href: ($(this).attr('href') || '').toString().trim(),
				filename: source.filename,
				sizes: ($(this).attr('sizes') || '').toString().trim(),
				source: source.source,
				type: ($(this).attr('type') || '').toString().trim(),
			});
		});

		// return all found icons of the website.
		return icons;
	}
};
