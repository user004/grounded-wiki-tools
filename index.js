import deepMerge from './utils/deepMerge.js';
import getAllTables from './utils/text/getAllTables.js';
import getStringFromTable from './utils/text/getStringFromTable.js';
import parsePathData from './utils/parsePathData.js';
import rawScience from './utils/templates/rawScience.js';
import replaceFormat from './utils/text/replaceFormat.js';

const DEBUG = false;

const allTables = getAllTables();

const rangerQuests = parsePathData('/Game/Blueprints/BurgleQuests/ASLQuestCollection.0')?.Properties?.Collection || [];

for (const [key, { ObjectPath }] of Object.entries(rangerQuests)) {
	// if (+key !== 60) continue;

	const questData = parsePathData(ObjectPath);
	const questClass = parsePathData(questData.ClassDefaultObject?.ObjectPath);
	const templateClass = parsePathData(questClass?.Template?.ObjectPath);

	const templateProps = templateClass?.Properties || {};
	if (DEBUG) console.log(templateProps);

	const questProps = questClass?.Properties || {};
	if (DEBUG) console.log(questProps);

	// const combinedProps = Object.assign(templateProps, questProps);
	const combinedProps = deepMerge(templateProps, questProps);
	if (DEBUG) console.log(combinedProps);

	// seem to be working, leave alone
	const title = getStringFromTable(allTables, combinedProps.TitleString);
	const descriptionFormat = getStringFromTable(allTables, combinedProps.ObjectiveFormatString);
	const rs = rawScience(combinedProps.RawScienceReward);

	// seem to need some work
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
	if (qty) {
		replaced += ` (0/${qty})`;
	}

	if (DEBUG) console.log({ descriptionFormat, itemName, qty, replaced });

	/* row format:
		|-
		| quest #, 1-indexed
		| title, ex: '''Play Koi'''
		| description and amount, if applicable, ex: Harvest: Clover Leaf (0/3)
		| raw science amount
	*/
	const cols = [
		'|-',
		+key + 1,
		`'''${title}'''`,
		`${replaced}`,
		rs,
	];
	if (!DEBUG) console.log(cols.join(`\n| `));
}
