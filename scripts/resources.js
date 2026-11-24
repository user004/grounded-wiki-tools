import ue from '../utils/ue.js';
import text from '../utils/text.js';
import wiki from '../utils/wiki.js';

const resourceObjects = ue.parsePathData('/Game/Blueprints/Items/ItemTables/Table_Items_NaturalResources').Rows || {};

let resources = [];
Object.keys(resourceObjects).forEach(resourceKey => {
	const resourceObject = resourceObjects[resourceKey];
	const resourceName = text.getStringFromTable(resourceObject.LocalizedDisplayName);
	if (!resourceName) return;

	resources.push({
		key: resourceKey,
		name: resourceName,
		description: text.getStringFromTable(resourceObject.LocalizedDescription),
		tier: resourceObject.Tier,
	});
});

const tableHeader = wiki.tableHeader([
	'Resource',
	{
		attributes: {
			class: 'unsortable',
		},
		content: 'Description',
	},
	{
		attributes: {
			class: 'unsortable',
		},
		content: 'Recipe',
	},
]);

const tableRows = resources
	.sort((a, b) => {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;
		return 0;
	})
	.sort((a, b) => {
		if (a.tier < b.tier) return -1;
		if (a.tier > b.tier) return 1;
		return 0;
	})
	.map(resource =>
		wiki.tableRow([
			`${wiki.icon(resource.name, 50, 'bottom')}${resource.tier > 0 ? `<br>${wiki.tier(resource.tier)}` : ''}`,
			resource.description,
		]));

console.log(wiki.table([tableHeader, ...tableRows], {
	sortable: true,
	collapsible: true,
	styles: {
		textAlign: 'center',
	},
}));

wiki.timestamp();
