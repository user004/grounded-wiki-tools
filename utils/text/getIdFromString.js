const getIdFromTable = (stringTables, string) =>
	stringTables
		.flatMap(table => table.Value.Entries)
		.find(({ Value: { DefaultText } }) =>
			DefaultText.localeCompare(string, undefined, {
				sensitivity: 'base',
			}) === 0)
		?.Value?.ID;

export default getIdFromTable;
