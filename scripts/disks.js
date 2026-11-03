import ue from '../utils/ue.js';
import text from '../utils/text.js';
import wiki from '../utils/wiki.js';

const trees = ue.parsePathData('/Game/Blueprints/Items/Table_TechTrees.0').Rows || {};
let i = 0;

const tableHeader = wiki.tableHeader([
	{
		attrs: {
			style: 'width: 20%',
		},
		content: 'Upgrade',
	},
	{
		attrs: {
			style: 'width: 15%',
		},
		content: 'Cost',
	},
	{
		attrs: {
			style: '',
		},
		content: 'Unlocks',
	},
]);

Object.values(trees).forEach(tree => {
	i++;
	// if (i !== 2) return false;

	const treeName = text.getStringFromTable(tree.DisplayName);
	console.log(wiki.title(treeName, 3));

	const recipeGroups = ue.parsePathData(tree.TechTreeRecipesTable?.ObjectPath || '').Rows || {};

	const rows = Object.values(recipeGroups).map(recipeGroup => {
		const groupName = text.getStringFromTable(recipeGroup.OverrideDisplayName);
		const groupCost = recipeGroup.Cost || 0;
		const groupUnlocks = recipeGroup.UnlockData || [];


		const unlockList = groupUnlocks.map(groupUnlock => {
			const unlockObject = ue.getDataTableItem(groupUnlock) || {};

			const isBuilding = Object.hasOwn(unlockObject, 'Building');
			const isCraftable = Object.hasOwn(unlockObject, 'CraftedItem');
			const isSignSet = Object.hasOwn(unlockObject, 'Table');
			let unlock = {};

			let unlockName = '';

			if (isBuilding || isCraftable) {
				unlock = ue.getDataTableItem(unlockObject.Building || unlockObject.CraftedItem);
				unlockName = text.getStringFromTable(unlock.LocalizedDisplayName);
			} else if (isSignSet) {
				unlock = ue.parsePathData(unlockObject.Table?.ObjectPath || '').Rows || {};
				unlockName = Object.values(unlock).map(sign => {
					return sign.Icon.AssetPathName.split('.')[0].split('/').at(-1).replace('_UI_', '_');
				});
			}

			return unlockName;
		})
			.reduce((acc, current) => {
				if (!acc.includes(current)) acc.push(current);
				return acc;
			}, []);

		// console.log({
		// 	name: groupName,
		// 	cost: groupCost,
		// 	unlocks: unlockList,
		// });

		return wiki.tableRow([
			{
				attrs: {
					style: 'text-align: left;',
				},
				content: groupName,
			},
			wiki.rawScience(groupCost),
			{
				attrs: {
					style: `text-align: ${Array.isArray(unlockList[0]) ? 'center' : 'left'}; text-wrap: balance;`,
				},
				content: Array.isArray(unlockList[0])
					? `\n${unlockList.flatMap(list => [...list]).map(item => `[[File:${item}.png|70px]]`).join(`\n`)}\n`
					: wiki.list(unlockList.map(item => wiki.link(item))),
			},
		]);
	});

	console.log(wiki.table([tableHeader, ...rows], false, false, false));
});

wiki.timestamp();
