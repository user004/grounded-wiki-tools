import fs from 'node:fs';
import path from 'node:path';
import parsePathData from '../parsePathData.js';

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
		const textData = parsePathData(releaseTextPath);
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

export default getAllTables;
