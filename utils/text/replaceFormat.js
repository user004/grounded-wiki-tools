import wiki from '../wiki.js';

/**
 * replaces UE formatting with a string, can wrap with wiki link
 * @param {string} format - string with formatting
 * @param {string} replace - string to be replaced
 * @param {boolean} [wrap=false] - TODO: make this work
 */
const replaceFormat = (format, replace, wrap = false) => {
	if (!format) return '';
	let replaced = format;
	const regex = /\{([^}]+)\}/gi;
	const matches = format.matchAll(regex);
	matches.forEach(match => {
		let replacer = replace;
		switch (match[1]) {
			case 'BuildingName':
			case 'CreatureName':
			case 'ItemName':
				// replacer = `[[${replace}]]`;
				replacer = wiki.link(replace);
				break;
			default:
				// no default
		}
		replaced = format.replaceAll(regex, replacer);
		// console.log(replaced);
	});

	return replaced;
};

export default replaceFormat;
