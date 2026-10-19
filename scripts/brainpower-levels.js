import text from '../utils/text.js';
import ue from '../utils/ue.js';
import wiki from '../utils/wiki.js';

const allTables = text.getAllTables();

// found this, wanted to save it somewhere, could build into brainpower tiers/unlocks
// Augusta/Content/Blueprints/Items/Table_AllItems --- NewResearchUnlockRecipes
// Augusta/Content/Blueprints/Global/GlobalItemData.json --- ResearchLevels

const researchLevels = ue.parsePathData('/Game/Blueprints/Global/GlobalItemData.0')?.Properties?.ResearchLevels || [];

let level = 1;
const levelRows = researchLevels.map(({ ResearchPointThreshold, UnlockRecipes, BonusScienceAtLevel }) => {
	// const level = text.getStringFromTable(allTables, LocalizedDisplayName);
	const unlocks = UnlockRecipes.map(unlockRecipe => {
		const recipe = ue.getDataTableItem(unlockRecipe);

		/*
		Building
		CraftedItem
		*/
		const crafted = ue.getDataTableItem(
			recipe.CraftedItem ||
			recipe.Building ||
			{});

		const craftedName = text.getStringFromTable(allTables, crafted.LocalizedDisplayName);

		return wiki.icon(craftedName, 32);
	})
		// filter out nulls and duplicates
		.filter((item, index, self) => item && self.indexOf(item) === index);

	return wiki.tableRow([
		level++,
		ResearchPointThreshold,
		{ attrs: { style: 'text-align: left;' }, content: wiki.list(unlocks) },
		wiki.rawScience(BonusScienceAtLevel),
	]);
});

// header
const headerRow = wiki.tableHeader([
	{ attrs: {}, content: 'Level' },
	{ attrs: { class: 'unsortable' }, content: 'Total BP' },
	{ attrs: { class: 'unsortable' }, content: 'Unlocks' },
	{ attrs: { class: 'unsortable' }, content: 'RS Reward' },
]);

// add a row for level 0
const zeroRow = wiki.tableRow([
	0,
	0,
	'-',
	'-',
]);

console.log(wiki.table([headerRow, zeroRow, ...levelRows], true, true, true));
