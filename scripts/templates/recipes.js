import ue from '../../utils/ue.js';
import text from '../../utils/text.js';
import wiki from '../../utils/wiki.js';
import recipe from './recipe.js';

/* inteded to generate https://grounded.wiki.gg/wiki/Template:Recipe/G2
example output:
| Stuffed Centipede = {{Recipe:Item/G2|Item=Stuffed Centipede|Material1Quanity=2|Material1=Centipede Antenna|Material2Quanity=5|Material2=Centipede Segment|Material3Quanity=8|Material3=Centipede Leg|Material4Quanity=6|Material4=Cattail Fluff|Station=Crafted in World}}
| Arrow = {{Recipe:Item/G2|Item=Arrow|Amount=(x10)|Material1Quantity=2|Material1=Mite Fuzz|Material2Quantity=5|Material2=Thistle Needle|Station=Crafted by Hand}}
*/

let recpies = [];

// TODO: util?
const globalData = ue.parsePathData('/Game/_Augusta/Global/Data/GlobalUIData_Augusta.0')?.Properties?.CraftingBuildingIcons || [];

const craftingRecipes = ue.parsePathData('/Game/Blueprints/Items/Table_CraftingRecipes.0').Rows || {};
const buildingRecipes = ue.parsePathData('/Game/Blueprints/Items/Table_BuildingRecipes.0').Rows || {};

// merge and loop
const recipes = [
	...Object.values(craftingRecipes),
	...Object.values(buildingRecipes),
].map(recipeObject => {
	// skip if empty (playgrounds exclusive?)
	if (recipeObject.Requirements.length === 0) return;

	// CraftedItem - the item
	const craftedObject = ue.getDataTableItem(recipeObject.CraftedItem || recipeObject.Building);
	let craftedName = text.getStringFromTable(craftedObject.LocalizedDisplayName);

	// CraftingBuildingTag - station
	const buildingTag = recipeObject?.CraftingBuildingTag?.TagName || '';
	// TODO: convert this
	const buildingObject = globalData.find(data => data?.Key?.TagName === buildingTag);
	let buildingName = text.getStringFromTable(buildingObject?.Value?.CraftingBuildingName) || '';

	// Requirements - mats
	const craftedMaterials = recipeObject.Requirements.map(requirement => {
		const materialObject = ue.getDataTableItem(requirement.Item);

		return {
			name: text.getStringFromTable(materialObject.LocalizedDisplayName) || '',
			quantity: requirement.ItemCount || 0,
		};
	});

	// CraftedItemCount - amount crafted
	const craftedQuantity = recipeObject.CraftedItemCount || 0;

	// manual override for shorter wall mount names
	const category = recipeObject.CategoryTag.TagName || '';
	if (category === 'Recipe.Building.BugTrophy.Trophy.Mounted' ||
		category === 'Recipe.Building.Decoration.Decor.Art') {
		craftedName = craftedName.replace('Wall Mount', 'Mount');
	}

	// manual override for buffin' barrel
	if (buildingTag === 'CraftingBuilding.BuggyBuffing') {
		// name isn't in GlobalUIData_Augusta
		buildingName = 'Buffin\' Barrel';

		// wiki-appropriate recipe names
		const rowName = recipeObject?.CraftedItem?.RowName || '';
		const rowNumber = +rowName.at(-1);

		// buggy evolutions - in release order (and tier... coincidentally)
		const buggyTierInfo = {
			AntEvolution: {
				name: 'Red Soldier Ant Buggy',
				tier: 1,
			},
			SpiderEvolution: {
				name: 'Orb Weaver Buggy',
				tier: 2,
			},
			LadybugEvolution: {
				name: 'Ladybuggy',
				tier: 2,
			},
			BlackAntEvolution: {
				name: 'Black Soldier Ant Buggy',
				tier: 3,
			},
			ToeBiterEvolution: {
				name: 'Toe Biter Nymph Buggy',
				tier: 3,
			},
			PotatoEvolution: {
				name: 'Potato Beetle Buggy',
				tier: 3,
			},
		}

		// TODO: template switch name and display name are not the same?
		// | Orb Weaver Buggy T3 = {{Recipe:Item/G2 | Item=Orb Weaver Buggy Tier 3 | ... }}
		const buggyInfo = buggyTierInfo[rowName.slice(0, -1)];
		craftedName = `${buggyInfo.name} T${rowNumber + buggyInfo.tier}`;
	}

	let recipeTemplate = recipe.item(craftedName, craftedMaterials, buildingName, craftedQuantity);

	if (buildingTag === 'CraftingBuilding.Mixer') {
		recipeTemplate = recipe.smoothie(craftedName, craftedMaterials);
	}

	return `|${craftedName}=${recipeTemplate}`;
})
	.filter(recipe => recipe)
	.sort()
	.reduce((acc, current) => {
		if (!acc.includes(current)) acc.push(current);
		return acc;
	}, []);

console.log(`{{#switch:{{{1|{{PAGENAME}}}}}\n${recipes.join('\n')}\n}}<noinclude>{{Documentation}}</noinclude>`);

wiki.timestamp();
