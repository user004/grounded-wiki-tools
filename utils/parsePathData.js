import fs from 'node:fs';
import path from 'node:path';

/**
 * parses data from a UE path string
 * @param {string} stringPath - the path, including the "dot index" suffix
 * @returns {object} the JSON data
 */
const parsePathData = (stringPath) => {
	// console.log('parsePathData', { stringPath });

	if (!stringPath) return {};

	const [ dataPath = '', dataIndex = '0' ] = stringPath.split('.');
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

export default parsePathData;
