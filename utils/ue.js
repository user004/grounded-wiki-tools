import fs from 'node:fs';
import path from 'node:path';
import constants from './constants.js';
import sharp from 'sharp';

let dataTableCache = {};

// TODO: clean this up
// https://sharp.pixelplumbing.com/api-composite/
const extractIcon = (iconPath = '', iconName = '', layerPath = '') => {
	const [splitPath = ''] = iconPath.split('.');
	const fromPath = path.format({
		root: constants.getConstant('appData'),
		name: splitPath,
		ext: 'png',
	});

	const toPath = path.format({
		root: constants.getConstant('appOutput'),
		name: iconName.replaceAll(/\//g, '-'),
		ext: 'png',
	});

	if (!fs.existsSync(fromPath)) {
		console.log(`Does not exist: ${fromPath}`)
		return;
	}

	if (layerPath) {
		const [splitPath = ''] = layerPath.split('.');
		const layerPathFormat = path.format({
			root: constants.getConstant('appData'),
			name: splitPath,
			ext: 'png',
		});
		console.log(layerPath, layerPathFormat);
		sharp(fromPath)
			.resize(128)
			.composite([{ input: layerPathFormat, top: 0, left: 0 }])
			.toFile(toPath);

	} else {
		sharp(fromPath)
			.resize(128, 128, 'inside')
			.toFile(toPath);
	}
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
		// TODO: replace with constant?
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
	extractIcon,
	getDamageTypes,
	getDataTableItem,
	getPlacementTypes,
	parsePathData,
};
