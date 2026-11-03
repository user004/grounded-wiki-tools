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

const getBuildingName = (buildingTag = '') => {
	if (!buildingTag) return '';

	// name isn't in GlobalUIData_Augusta
	switch (buildingTag) {
		case 'CraftingBuilding.BuggyBuffing':
			return `Buffin' Barrel`;

		case 'CraftingBuilding.Glue':
			return 'Glue Masher';

		case 'CraftingBuilding.Hatchery':
			return 'Hatchery';

		case 'CraftingBuilding.SausageMachine':
			return 'Sausager';

		case 'Recipe.Crafting.Survival.Light':// ???
		case 'CraftingBuilding.Workbench.CraftableInPlayerMenu':
			return 'Crafted by Hand';

		default:
			const buildingObject = globalData.find(data => data?.Key?.TagName === buildingTag);
			return text.getStringFromTable(buildingObject?.Value?.CraftingBuildingName) || '';
	}
};

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
	const rowName = recipeObject?.CraftedItem?.RowName || '';

	// CraftingBuildingTag - station
	const buildingTag = recipeObject?.CraftingBuildingTag?.TagName || '';
	let buildingName = getBuildingName(buildingTag);

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
	const categoryTag = recipeObject.CategoryTag.TagName || '';
	if (categoryTag === 'Recipe.Building.BugTrophy.Trophy.Mounted' ||
		categoryTag === 'Recipe.Building.Decoration.Decor.Art') {
		craftedName = craftedName.replace('Wall Mount', 'Mount');
	}

	// manual override for buffin' barrel item names
	if (buildingTag === 'CraftingBuilding.BuggyBuffing') {
		// wiki-appropriate recipe names
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

		/* overrides for non-matching
			|Station=Buffin' Barrel
				By Hand
				Crafted by Hand
				Crafted in World
				Crafted in World Underwater
				EverChar Roasting Spit
				Glitter Bar
				Glue Masher
				Hatchery
		*/

		// TODO: template switch name and display name are not the same?
		// | Orb Weaver Buggy T3 = {{Recipe:Item/G2 | Item=Orb Weaver Buggy Tier 3 | ... }}
		const buggyInfo = buggyTierInfo[rowName.slice(0, -1)];
		craftedName = `${buggyInfo.name} T${rowNumber + buggyInfo.tier}`;
	}

	// TODO: do these

	if (categoryTag === 'None') {
		// omnitools
		if (rowName.startsWith('Omnitool_')) {
			buildingName = 'Glitter Bar';
			craftedName = `Omni-Tool ${rowName.split('_').pop()}`;
		}

		// scabs
		if (rowName.startsWith('SCAB_')) {
			buildingName = 'Glitter Bar';
			craftedName = `SCA.B 2K ${rowName.split('_').pop()}`;
		}

		// ziplines?
		if (craftedName === 'Zipline') {
			buildingName = 'Crafted in World';
		}
	}

	// land, aquatic, amphibious
	const buildingPlacementType = craftedObject?.PlacementType || 0;
	if (categoryTag.startsWith('Recipe.Building.')) {
		// default
		buildingName = 'Crafted in World';

		switch (buildingPlacementType) {
			case 2:
			case 4:
			case 6:
				buildingName += ' (Aquatic)';
				break;

			case 5:
			case 7:
				buildingName += ' (Amphibious)';
				break;

			case 1:
			case 3:
			default:
				// intentionally left blank
				break;
		}
	}

	// TODO: something to make multi recipe items with different names
	// TODO: things without station???

	let recipeTemplate = recipe.item(craftedName, craftedMaterials, buildingName, craftedQuantity);
	// smoothies get different template
	if (buildingTag === 'CraftingBuilding.Mixer') {
		recipeTemplate = recipe.smoothie(craftedName, craftedMaterials);
	}

	if (!buildingName) {
		// console.log(rowName, craftedName);
	}

	return `|${craftedName}=${recipeTemplate}`;
})
	.filter(recipe => recipe)
	.sort()/*
	.reduce((acc, current) => {
		if (!acc.includes(current)) acc.push(current);
		return acc;
	}, []) */;

console.log(`{{#switch:{{{1|{{PAGENAME}}}}}\n${recipes.join('\n')}\n}}<noinclude>{{Documentation}}</noinclude>`);

wiki.timestamp();
