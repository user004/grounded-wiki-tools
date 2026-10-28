import constants from './constants.js';
import fs from 'node:fs';
import path from 'node:path';
import ue from './ue.js';
import wiki from './wiki.js';

let stringTableCache = [];

/**
 * Gets all localized string tables for a specific language.
 * @param {'dede' | 'enus' | 'eses' | 'esmx' | 'frfr' | 'itit' | 'jajp' | 'kokr' | 'ptbr' | 'zhch' | 'zhtw'} [lang=enus] - the language to get
 * @returns {object[]} The merged localized string tables.
 */
const getAllStringTables = (lang = 'enus') => {
	if (stringTableCache.length > 0) return stringTableCache;

	// TODO: replace this try/catch?
	try {
		fs.globSync(`data/Game/Exported/*/Localized/${lang}/Text/Text_${lang}.json`)
			.sort()
			.forEach(textFile => {
				JSON.parse(fs.readFileSync(textFile, 'utf-8'))?.[0]?.Properties?.StringTables
					.forEach(stringTable => {
						const foundIndex = stringTableCache.findIndex(table =>
							table.Key === stringTable.Key);

						if (foundIndex === -1) {
							stringTableCache.push(stringTable);
						} else {
							stringTableCache[foundIndex].Value.Entries
								.push(...stringTable.Value.Entries);
						}
					});
			});
	} catch (error) {
		console.error(error);
	}

	return stringTableCache;
};

/**
 * Finds the localized string ID for matching text, ignoring letter case.
 * @param {object[]} stringTables - Localized string tables to search.
 * @param {string} string - Text to find.
 * @returns {string|undefined} The matching string ID, if found.
 */
const getIdFromTable = (string) =>
	getAllStringTables()
		.flatMap(table => table.Value.Entries)
		.find(({ Value: { DefaultText } }) =>
			DefaultText.localeCompare(string, undefined, {
				sensitivity: 'base',
			}) === 0)
		?.Value?.ID;

/**
 * Gets localized text using its string table and string IDs.
 * @param {object[]} stringTables - Localized string tables to search.
 * @param {object} [StringObject={}] - The string table and string IDs.
 * @param {number} [StringObject.StringTableID=0] - The table ID.
 * @param {number} [StringObject.StringID=0] - The string ID.
 * @returns {string|false} The localized string, or false if the table or entry is missing.
 */
const getStringFromTable = ({ StringTableID = 0, StringID = 0 } = {}) => {
	// console.log('getStringFromTable', { StringTableID, StringID });
	// TODO: return something other than false?
	const hasTableId = StringTableID && StringTableID > 0;
	const hasStringId = StringID && StringID > 0;

	const tableIdToString = constants.getConstant('tableIdToString');
	const stringTableString = tableIdToString[StringTableID];
	if (!stringTableString) return false;
	const foundTableObject = getAllStringTables().find(({ Key }) => Key === `${stringTableString}`);
	if (!foundTableObject) return false;
	const foundStringObject = foundTableObject.Value.Entries.find(({ Key }) => Key === `${StringID}`);
	if (!foundStringObject) return false;
	return foundStringObject.Value.DefaultText || '';
};


/**
 * Replaces UE formatting placeholders with text, wrapping named placeholders in a wiki link.
 * @param {string} format - String with formatting placeholders.
 * @param {string} replace - Text to substitute for placeholders.
 * @returns {string} The formatted text.
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

export default { getAllStringTables, getIdFromTable, getStringFromTable, replaceFormat };
