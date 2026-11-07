import util from 'node:util';

/**
 * Checks whether a value is a non-array object.
 * @param {*} item - Value to check.
 * @returns {*} A falsy value, or whether the value is a non-array object.
 */
export const isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);

/**
 * Merges source properties into a deep copy of a target object.
 * @param {object} target - Object to copy and merge into.
 * @param {object} source - Object whose properties take precedence.
 * @returns {object} The merged object.
 */
const deepMerge = (target, source) => {
	// Create a deep copy of the target to prevent original mutation
	let output = structuredClone(target);

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				if (isObject(source[key])) {
					if (!(key in target)) {
						// If key doesn't exist in target, copy it completely
						output[key] = structuredClone(source[key]);
					} else {
						// If key exists in both, recursively merge them
						output[key] = deepMerge(target[key], source[key]);
					}
				} else {
					// If the source property is a primitive value, overwrite the target value
					output[key] = source[key];
				}
			}
		}
	}

	return output;
};

const camelToKebab = (string = '') =>
	string.replace(/([A-Z])/g, '-$1').toLowerCase();

const stringifyObject = (input = {}, type = 'attribute') => {
	let format;

	switch (type) {
		case 'style':
			format = '%s: %s;';
			break;

		case 'attribute':
			format = '%s="%s"';
			break;
	}

	let output = [];

	for (let [key, value] of Object.entries(input)) {
		if (!key || !value) continue;
		output.push(util.format(format, camelToKebab(key), value))
	}

	return output.join(' ');
}

export default { deepMerge, stringifyObject };
