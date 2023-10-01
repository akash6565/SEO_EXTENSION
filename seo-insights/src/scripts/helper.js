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

/* exported INFO */
/* exported getBaseUrl */
/* exported getName */
/* exported translateTextContent */

/*
 * The enum for the different information areas of this chrome extension.
 */
var INFO = {
	FILES: 'file',
	HEADER: 'header',
	HEADINGS: 'heading',
	IMAGES: 'images',
	LINKS: 'links',
	META: 'meta',
	SUMMARY: 'summary',
};

/**
 * Returns the base url of the website. It also considers the base url on meta information.
 * @returns {string} The base url of the website.
 */
function getBaseUrl() {
	const baseUrl = $('head > base').first().attr('href');

	// use the base url of the meta information if available.
	if (baseUrl) {
		return (new URL(baseUrl, (location.origin + location.pathname))).href;
	} else {
		return (new URL(location.origin + location.pathname)).href;
	}
}

/**
 * Returns the value of the name or property attribute of a given HTML element.
 * @param {object} html The HTML to get the value of name or property attribute.
 * @returns {string} The value of the name or property attribute of the given HTML element.
 */
function getName(html) {
	if ($(html).is('[property]')) {
		return $(html).attr('property').trim().toLowerCase();
	} else if ($(html).is('[name]')) {
		return $(html).attr('name').trim().toLowerCase();
	} else {
		return null;
	}
}

/**
 * Replace all placeholder for translation with translated value.
 */
function translateTextContent() {
	$("body").find("*").contents().each(function() {
		if (this.nodeType === 3) {
			this.textContent = this.textContent.replace(/__MSG_(\w+)__/g, function(match, word) {
				return word ? chrome.i18n.getMessage(word) : '';
			});
		}
	});
	$("body").find('a[href*="__MSG_"]').each(function() {
		this.href = this.href.replace(/__MSG_(@@\w+)__/g, function(match, word) {
			return word ? chrome.i18n.getMessage(word) : '';
		});
	});
}
