const tableIdToString = {
	  2: 'game/items',
	  9: 'game/characters',
	 22: 'game/buildings',
	193: 'game/burglequests',
	// TODO: add more
};

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

	const stringTableString = tableIdToString[StringTableID];
	if (!stringTableString) return false;
	const foundTableObject = stringTables.find(({ Key }) => Key === `${stringTableString}`);
	if (!foundTableObject) return false;
	const foundStringObject = foundTableObject.Value.Entries.find(({ Key }) => Key === `${StringID}`);
	if (!foundStringObject) return false;
	return foundStringObject.Value.DefaultText || '';
};

export default getStringFromTable;
