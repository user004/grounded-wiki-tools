// Helper to verify if an item is a plain object
const isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);

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

export default deepMerge;
