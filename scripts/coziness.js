import text from '../utils/text.js';
import ue from '../utils/ue.js';
import wiki from '../utils/wiki.js';

const cozyLevels = ue.parsePathData('/Game/Blueprints/Global/GlobalBuildingData.0').Properties.CozinessLevels || [];

// for some reason perks aren't actually in the cozy data
// TODO: grab this dynamically from Table_Perks
const manualPerks = [
	,// nothing in level 1
	'[[File:Mutation Hauling Hero.png|30px|link=Mutations (Grounded 2]] [[Mutations (Grounded 2)|Hauling Hero]] (Phase 1)',
	'[[File:Mutation Hauling Hero.png|30px|link=Mutations (Grounded 2]] [[Mutations (Grounded 2)|Hauling Hero]] (Phase 2)',
	'[[File:Mutation Hauling Hero.png|30px|link=Mutations (Grounded 2]] [[Mutations (Grounded 2)|Hauling Hero]] (Phase 3)',
];

let i = 0;
let ongoingStatues = [];
const cozyRows = cozyLevels.map(level => {
	let unlocks = [];

	// buildables
	level.UnlockRecipes.forEach(recipe => {
		const recipeObject = ue.getDataTableItem(recipe);
		const itemObject = ue.getDataTableItem(recipeObject.Building || recipeObject.CraftedItem)
		const itemName = text.getStringFromTable(itemObject.LocalizedDisplayName);
		unlocks.push(wiki.icon(itemName, 30))
	});

	// perks
	if (manualPerks[i]) unlocks.push(manualPerks[i]);

	// emotes
	level.UnlockEmotes.forEach(emote => {
		const emoteObject = ue.getDataTableItem(emote);
		const emoteName = text.getStringFromTable(emoteObject.EmoteName);
		unlocks.push(`[[File:Emote ${emoteName}.png|30px|link=Emotes#_Grounded_2_-0]] [[Emotes#_Grounded_2_-0|${emoteName}]]`);
	});

	// statuses
	level.StatusEffects.forEach(status => {
		const statusObject = ue.getDataTableItem(status);
		const statusName = text.getStringFromTable(statusObject.DisplayData.Name);
		ongoingStatues.push(`[[File:${statusName}.png|50px|link=Status Effects (Grounded 2)]]<br>${statusName}`);
	});

	// output
	i++;
	return wiki.tableRow([
		`Level ${i}`,
		level.RequiredValue || 0,
		wiki.list(unlocks),
		ongoingStatues.join('<br>'),
	]);
});

const cozyHeader = wiki.tableHeader([
	{
		attrs: {
			style: '',
		},
		content: 'Level',
	},
	{
		attrs: {
			style: '',
		},
		content: 'Total Coziness',
	},
	{
		attrs: {
			class: 'unsortable',
		},
		content: 'Unlocks',
	},
	{
		attrs: {
			class: 'unsortable',
			style: 'width: 15%',
		},
		content: 'Unlocks',
	},
]);

console.log(wiki.table([cozyHeader, ...cozyRows], {
	styles: {
		textAlign: 'center',
	}
}));

wiki.timestamp();
