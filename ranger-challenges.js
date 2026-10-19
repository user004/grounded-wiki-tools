import deepMerge from './utils/deepMerge.js';
import getAllTables from './utils/text/getAllTables.js';
import getStringFromTable from './utils/text/getStringFromTable.js';
import parsePathData from './utils/parsePathData.js';
import replaceFormat from './utils/text/replaceFormat.js';
import wiki from './utils/wiki.js';

const allTables = getAllTables();

const rangerQuests = parsePathData('/Game/Blueprints/BurgleQuests/ASLQuestCollection.0')?.Properties?.Collection || [];

let i = 1;
const questRows = rangerQuests.map(({ ObjectPath }) => {
	const questData = parsePathData(ObjectPath);
	const questClass = parsePathData(questData.ClassDefaultObject?.ObjectPath);
	const templateClass = parsePathData(questClass?.Template?.ObjectPath);

	const templateProps = templateClass?.Properties || {};

	const questProps = questClass?.Properties || {};

	const combinedProps = deepMerge(templateProps, questProps);

	const title = getStringFromTable(allTables, combinedProps.TitleString);
	const descriptionFormat = getStringFromTable(allTables, combinedProps.ObjectiveFormatString);

	let itemName = getStringFromTable(allTables,
		combinedProps.CreatureDisplayName ||
		combinedProps.ObjectiveCombo ||
		// combinedProps.ObjectiveDisplay ||// required by ### but not by 24 (weakpoint)???
		combinedProps.ObjectiveItemName ||
		'');
	const qty =
		combinedProps.CraftQty ||
		combinedProps.HowMany ||
		combinedProps.ItemQty ||
		combinedProps.KillQty ||
		combinedProps.Quantity ||
		combinedProps.StatChangeAmt ||
		combinedProps.TargetCozinessLevel ||// inside ChildProperties
		combinedProps.TargetMutationCount ||// inside ChildProperties, can use to determine this list instead of manual?
		combinedProps.TargetTotalUpgradeLevel ||
		0;

	if (!itemName) {
		const logicalItem = [...Object.keys(combinedProps)].find(key => key.includes('LogicalOr'));
		// TODO: make get item from table?
		if (logicalItem) {
			const logicalItemFound = combinedProps[logicalItem]?.[0];
			if (logicalItemFound) {

				const allItems = parsePathData(logicalItemFound.DataTable?.ObjectPath);
				if (allItems) {
					const currentItem = allItems.Rows[logicalItemFound.RowName];
					itemName = getStringFromTable(allTables, currentItem.LocalizedDisplayName)
				}
			}
		}
	}

	// find+replacing
	let replaced = replaceFormat(descriptionFormat, itemName || qty);

	// TODO: change to > 1?
	if (qty) replaced += ` (0/${qty})`;

	/* row format:
		|-
		| quest #, 1-indexed
		| title, ex: '''Play Koi'''
		| description and amount, if applicable, ex: Harvest: Clover Leaf (0/3)
		| raw science amount in template format
	*/
	return wiki.tableRow([
		i++,
		wiki.bold(title),
		replaced,
		wiki.rawScience(combinedProps.RawScienceReward),
	]);
});

const headerRows = [
	wiki.tableHeader([
		{ attrs: { colspan: 4 }, content: 'Ranger Challenges' },
	]),
	wiki.tableHeader([
		{ attrs: {}, content: '#' },
		{ attrs: {}, content: 'Quest' },
		{ attrs: {}, content: 'Description' },
		{ attrs: {}, content: 'Raw Science Reward' },
	]),
];

console.log(wiki.table([...headerRows, ...questRows], false, true));
