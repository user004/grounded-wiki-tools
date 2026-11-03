import fs from 'node:fs';
import path from 'node:path';
import constants from './constants.js';

let dataTableCache = {};

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

const getDamageTypes = (value) => {
	let names = [];

	for (let [bit, name] of Object.entries(constants.getConstant('damageTypeFlags'))) {
		if (value & bit) names.push(name);
	}

	return names;
};

const getPlacementTypes = (value) => {
	let names = [];

	for (let [bit, name] of Object.entries(constants.getConstant('placementTypeFlags'))) {
		if (value & bit) names.push(name);
	}

	return names;
};

/**
 * Gets a row from a referenced Unreal Engine data table.
 * @param {{DataTable: {ObjectPath?: string}, RowName?: string}} reference - Data table and row reference.
 * @returns {object} The matching row, or an empty object if its object path or row name is missing.
 */
const getDataTableItem = ({ DataTable: { ObjectName = '', ObjectPath = '' }, RowName = '' }) => {
	if (!ObjectPath || !RowName) return {};

	let dataTable = {};
	if (!Object.hasOwn(dataTableCache, ObjectName) || !dataTableCache[ObjectName]) {
		dataTableCache[ObjectName] = parsePathData(ObjectPath);
	}

	dataTable = dataTableCache[ObjectName];

	const validKey = Object.keys(dataTable?.Rows).find(row =>
		row.localeCompare(RowName, undefined, { sensitivity: 'base' }) === 0);

	return dataTable?.Rows?.[validKey] || {};;
};

/**
 * Checks whether a value is a non-array object.
 * @param {*} item - Value to check.
 * @returns {*} A falsy value, or whether the value is a non-array object.
 */
const isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);

/**
 * Parses data from a UE path string.
 * @param {string} stringPath - The path, including the "dot index" suffix.
 * @returns {object|false} The parsed JSON data, or false if it cannot be read.
 */
const parsePathData = (stringPath) => {
	// console.log('parsePathData', { stringPath });
	// TODO: add to cache?

	if (!stringPath) return {};

	const [dataPath = '', dataIndex = '0'] = stringPath.split('.');
	const absolutePath = path.format({
		root: 'data',
		name: dataPath,
		ext: 'json',
	});

	const data = fs.readFileSync(absolutePath, 'utf8');

	if (!data) return false;

	const jsonData = JSON.parse(data);

	if (!jsonData) return false;

	return jsonData[dataIndex] || {};
};

export default {
	deepMerge,
	getDamageTypes,
	getDataTableItem,
	getPlacementTypes,
	parsePathData,
};
