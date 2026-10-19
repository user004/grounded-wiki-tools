import parsePathData from './parsePathData.js';

const getDataTableItem = ({ DataTable: { ObjectPath = '' }, RowName = '' }) => {
	if (!ObjectPath || !RowName) return {};

	const dataTable = parsePathData(ObjectPath);
	const validKey = Object.keys(dataTable?.Rows).find(row =>
		row.localeCompare(RowName, undefined, { sensitivity: 'base' }) === 0);

	return dataTable?.Rows?.[validKey] || {};;
};

export default getDataTableItem;
