import fs from 'node:fs';
import path from 'node:path';

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

const getDataTableItem = ({ DataTable: { ObjectPath = '' }, RowName = '' }) => {
	if (!ObjectPath || !RowName) return {};

	const dataTable = parsePathData(ObjectPath);
	const validKey = Object.keys(dataTable?.Rows).find(row =>
		row.localeCompare(RowName, undefined, { sensitivity: 'base' }) === 0);

	return dataTable?.Rows?.[validKey] || {};;
};

/**
 * parses data from a UE path string
 * @param {string} stringPath - the path, including the "dot index" suffix
 * @returns {object} the JSON data
 */
const parsePathData = (stringPath) => {
	// console.log('parsePathData', { stringPath });

	if (!stringPath) return {};

	const [dataPath = '', dataIndex = '0'] = stringPath.split('.');
	const absolutePath = path.format({
		root: 'data',
		name: dataPath,
		ext: 'json',
	});

	const resolvedPath = path.resolve(absolutePath);

	if (!resolvedPath) return false;

	const data = fs.readFileSync(resolvedPath, 'utf8');

	if (!data) return false;

	const jsonData = JSON.parse(data);

	if (!jsonData) return false;

	return jsonData[dataIndex] || {};
};

export default { deepMerge, getDataTableItem, parsePathData };
