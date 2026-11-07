import text from '../utils/text.js';
import ue from '../utils/ue.js';
import wiki from '../utils/wiki.js';


const fixUnlocks = (unlock) => {
	let replaced = unlock;

	[
		{
			find: /\bInt\./i,
			replace: 'Interior',
		},
		{
			find: /\bSq\./i,
			replace: 'Squared',
		},
	].forEach(({ find, replace }) => {
		if (replaced.match(find)) replaced = replaced.replace(find, replace);
	});

	return replaced;
}

// TODO: do something with this
const args = process.argv.slice(2);
if (args.length) {
	// console.log("Arguments were passed!");
} else {
	// console.log("No arguments were passed.");
}
// console.log(args);

// const testing = text.getIdFromTable(args[0]);
// console.log(testing);

const allItems = ue.parsePathData('/Game/Blueprints/Items/Table_AllItems.0')?.Rows || [];
// console.log(allItems);


// const filteredItems = Object.entries(allItems).filter(([key]) => finder.test(key));
// console.log(filteredItems);


const unlockables = Object.values(allItems)
	.filter(({ NewResearchUnlockRecipes }) => NewResearchUnlockRecipes.length > 0)
	.map(({ LocalizedDisplayName, NewResearchUnlockRecipes }) => {
		const itemName = text.getStringFromTable(LocalizedDisplayName);
		// console.group(itemName);
		const unlocks = NewResearchUnlockRecipes.map(unlockRecipe => {
			const recipe = ue.getDataTableItem(unlockRecipe);

			const crafted = ue.getDataTableItem(
				recipe.CraftedItem ||
				recipe.Building || {});

			const craftedName = text.getStringFromTable(crafted.LocalizedDisplayName);

			return wiki.link(fixUnlocks(craftedName));
		})
			.reduce((acc, current) => {
				if (!acc.includes(current)) {
					acc.push(current);
				}
				return acc;
			}, []);

		return {
			name: itemName,
			unlocks: unlocks,
		}
	})
	.sort((a, b) => {
		if (a.name.toUpperCase() < b.name.toUpperCase()) return -1;
		if (a.name.toUpperCase() > b.name.toUpperCase()) return 1;
		return 0;
	})
	.map(({ name, unlocks }) =>
		wiki.tableRow([
			{
				styles: {
					textAlign: 'center',
				},
				content: wiki.icon(name, 50, 'bottom')
			},
			wiki.list(unlocks),
		]));

const header = wiki.tableHeader([
	'Resource',
	{
		attributes: {
			class: 'unsortable',
		},
		content: 'Unlocked Recipe',
	},
]);

console.log(wiki.table([header, ...unlockables], {
	sortable: true,
	collapsible: true,
}));
/*
for (const [key, { LocalizedDisplayName, NewResearchUnlockRecipes }] of Object.entries(allItems)) {
	if (NewResearchUnlockRecipes.length > 0) {
		const itemName = text.getStringFromTable(LocalizedDisplayName);
		// console.log(itemName);
		const unlocks = NewResearchUnlockRecipes.map(unlock => {
			const unlockObject = ue.getDataTableItem(unlock);
			return text.getStringFromTable(unlockObject?.LocalizedDisplayName || {});
		});
		// console.log(itemName, unlocks);
	}
};
*/

wiki.timestamp();
