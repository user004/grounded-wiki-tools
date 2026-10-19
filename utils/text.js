import fs from 'node:fs';
import path from 'node:path';
import constants from './constants.js';
import ue from './ue.js';
import wiki from './wiki.js';

/**
 * gets all texts for a specific language
 * @param {'dede' | 'enus' | 'eses' | 'esmx' | 'frfr' | 'itit' | 'jajp' | 'kokr' | 'ptbr' | 'zhch' | 'zhtw'} [lang=enus] - the language to get
 * @return {object} an array of strings
 */
const getAllTables = (lang = 'enus') => {
	const absolutePath = path.format({
		root: 'data',
		name: '/Game/Exported',
	});
	const resolvedPath = path.resolve(absolutePath);
	const releases = fs.readdirSync(resolvedPath);

	const allTables = [];

	releases.forEach(release => {
		const releaseTextPath = path.join(
			'/Game/Exported',
			release,
			`Localized/${lang}/Text/Text_${lang}.0`,
		);
		const textData = ue.parsePathData(releaseTextPath);
		// return textData.Properties.StringTables;
		textData.Properties.StringTables.forEach(stringTable => {
			const allIndex = allTables.findIndex(table => table.Key === stringTable.Key);
			if (allIndex === -1) {
				allTables.push(stringTable);
			} else {
				allTables[allIndex].Value.Entries.push(...stringTable.Value.Entries);
			}
		});
	});

	return allTables;

};

const getIdFromTable = (stringTables, string) =>
	stringTables
		.flatMap(table => table.Value.Entries)
		.find(({ Value: { DefaultText } }) =>
			DefaultText.localeCompare(string, undefined, {
				sensitivity: 'base',
			}) === 0)
		?.Value?.ID;

/**
 * gets a string based on tabe and id (and manual
 * @param {Object} stringTables - array of string tables
 * @param {Object} StringObject - a StringObject object
 * @param {number} [StringObject.StringTableID=0] - the table ID
 * @param {number} [StringObject.StringID=0] - the string ID
 */
const getStringFromTable = (stringTables, { StringTableID = 0, StringID = 0 } = {}) => {
	// console.log('getStringFromTable', { StringTableID, StringID });
	// TODO: return something other than false?

	const tableIdToString = constants.getConstant('tableIdToString');
	const stringTableString = tableIdToString[StringTableID];
	if (!stringTableString) return false;
	const foundTableObject = stringTables.find(({ Key }) => Key === `${stringTableString}`);
	if (!foundTableObject) return false;
	const foundStringObject = foundTableObject.Value.Entries.find(({ Key }) => Key === `${StringID}`);
	if (!foundStringObject) return false;
	return foundStringObject.Value.DefaultText || '';
};


/**
 * replaces UE formatting with a string, can wrap with wiki link
 * @param {string} format - string with formatting
 * @param {string} replace - string to be replaced
 */
const replaceFormat = (format, replace) => {
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

export default { replaceFormat, getStringFromTable, getIdFromTable, getAllTables };
