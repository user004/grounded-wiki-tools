import getDataTableItem from './utils/getDataTableItem.js';
import parsePathData from './utils/parsePathData.js';
import getAllTables from './utils/text/getAllTables.js';
import getIdFromTable from './utils/text/getIdFromString.js';
import getStringFromTable from './utils/text/getStringFromTable.js';
import wiki from './utils/wiki.js';

const allTables = getAllTables();

// TODO: do something with this
const args = process.argv.slice(2);
if (args.length) {
	// console.log("Arguments were passed!");
} else {
	// console.log("No arguments were passed.");
}
// console.log(args);

// const testing = getIdFromTable(allTables, args[0]);
// console.log(testing);

const allItems = parsePathData('/Game/Blueprints/Items/Table_AllItems.0')?.Rows || [];
// console.log(allItems);


// const filteredItems = Object.entries(allItems).filter(([key]) => finder.test(key));
// console.log(filteredItems);


const unlockables = Object.values(allItems)
	.filter(({ NewResearchUnlockRecipes }) => NewResearchUnlockRecipes.length > 0)
	.map(({ LocalizedDisplayName, NewResearchUnlockRecipes }) => {
		const itemName = getStringFromTable(allTables, LocalizedDisplayName);
		// console.group(itemName);
		const unlocks = NewResearchUnlockRecipes.map(unlockRecipe => {
			// console.log(unlockRecipe);

			const recipe = getDataTableItem(unlockRecipe);
			// console.log(recipe);


			const crafted = getDataTableItem(
				recipe.CraftedItem ||
				recipe.Building || {});

			// console.log(crafted);


			const craftedName = getStringFromTable(allTables, crafted.LocalizedDisplayName);

			return wiki.link(craftedName);
		})
		.reduce((acc, current) => {
			if (!acc.includes(current)) {
				acc.push(current);
			}
			return acc;
		}, [])
		// .sort();
		console.groupEnd();
		return {
			name: itemName,
			unlocks: unlocks,
		}
	})
	.sort((a, b) => {
		if (a.name.toUpperCase() < b.name.toUpperCase()) {
			return -1;
		}

		if (a.name.toUpperCase() > b.name.toUpperCase()) {
			return 1;
		}

		return 0;
	})
	.map(({ name, unlocks }) =>
		wiki.tableRow([
			wiki.icon(name, 50, 'bottom'),
			{
				attrs: {
					style: "text-align: left;"
				},
				content: wiki.list(unlocks)
			}
		]));

const header = wiki.tableHeader([
	{ attrs: {}, content: 'Resource' },
	{ attrs: { class: 'unsortable' }, content: 'Unlocked Recipe' }
]);

console.log(wiki.table([header, ...unlockables], true, true));
/*
for (const [key, { LocalizedDisplayName, NewResearchUnlockRecipes }] of Object.entries(allItems)) {
	if (NewResearchUnlockRecipes.length > 0) {
		const itemName = getStringFromTable(allTables, LocalizedDisplayName);
		// console.log(itemName);
		const unlocks = NewResearchUnlockRecipes.map(unlock => {
			const unlockObject = getDataTableItem(unlock);
			return getStringFromTable(unlockObject?.LocalizedDisplayName || {});
		});
		// console.log(itemName, unlocks);
	}
};
*/
