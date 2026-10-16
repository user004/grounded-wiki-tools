import parsePathData from './parsePathData.js';

const getDataTableItem = ({ DataTable: { ObjectPath }, RowName }) => {
	if (!ObjectPath || !RowName) return {};
	return parsePathData(ObjectPath)?.Rows?.[RowName] || {};
};

export default getDataTableItem;
