import fs from 'node:fs';
import text from '../utils/text.js';
import ue from '../utils/ue.js';
import wiki from '../utils/wiki.js';

const removeHtml = (string) =>
	string.replaceAll(/<[^>]+>/g, '');

const buildings = ue.parsePathData('/Game/Blueprints/Items/Table_AllBuildings.0').Rows || {};
const recipes = ue.parsePathData('/Game/Blueprints/Items/Table_BuildingRecipes.0').Rows || {};

const keys = [
	// mushy
	'FloorMushroom',
	'FloorHalfMushroom',
	'FloorTriangleMushroom',
	'FloorQuarterMushroom',
	'FloorQuarterTriangleMushroom',
	'FloorMushroomCurved',
	'FloorMushroomCurvedHalf',
	'FloorMushroomCurvedHalfOuter',
	'FloorConcaveCurvedMushroom',
	// punkin
	'FloorPumpkin',
	'FloorPumpkinHalf',
	'FloorPumpkinTriangle',
	'FloorPumpkinQuarter',
	'FloorPumpkinQuarterTriangle',
	'FloorPumpkinCurved',
	'FloorPumpkinCurvedHalf',
	'FloorPumpkinCurvedHalfOuter',
	'FloorPumpkinConcaveCurved',
];

let groups = {
	mushroomFloors: [],
	pumpkinFloors: [],
}

Object.keys(buildings).forEach(key => {

	// keys.forEach(key => {
	// debug
	// if (key !== 'FloorMushroom') return;

	// objects
	const building = buildings[key];
	const recipe = recipes[key];

	// strings
	const name = removeHtml(text.getStringFromTable(building.LocalizedDisplayName));
	const desc = removeHtml(text.getStringFromTable(building.LocalizedDescription));

	// placement data - PlacementData.Actor.AssetPathName
	const [bpPath] = building.PlacementData.Actor.AssetPathName.split('.');
	const blueprint = JSON.parse(fs.readFileSync(`data/${bpPath}.json`, 'utf-8')).find(({ Type }) => Type === 'HealthComponent');

	let health;
	if (Object.hasOwn(blueprint, 'Properties') && Object.hasOwn(blueprint.Properties, 'MaxHealth')) {
		health = blueprint.Properties.MaxHealth;
	} else {
		const template = ue.parsePathData(blueprint.Template.ObjectPath);
		if (Object.hasOwn(template, 'Properties') && Object.hasOwn(template.Properties, 'MaxHealth')) {
			health = template.Properties.MaxHealth;
		}
	}

	// cozy data
	const cozy = building.CozinessContribution;
	const cozyPlus = building.CozinessAdditionalContribution;

	// recipe
	const components = recipe.Requirements.map(({ Item = {}, ItemCount = 0 }) => {
		let itemName = Item.RowName;
		if (Object.hasOwn(Item, 'DataTable') &&
			Object.hasOwn(Item, 'RowName')) {
			itemName = text.getStringFromTable(ue.getDataTableItem(Item).LocalizedDisplayName);
		}

		return `${ItemCount} ${wiki.icon(itemName)}`;
	});

	// category - for manually writing unlock req
	// TODO: replace with something that looks for resource/brainpower/cozy/ranger unlocks
	const cat = building.PlacementData.UGCSubcategoryTag.TagName.toLowerCase();
	let unlock = '';
	let group;
	if (cat.includes('mushroom')) {
		unlock = 'Purchasing [[Optical Disks#Gnarly_Bark_Aquatic_Optical_Disk|Mushroom Floors]] from a [[Ranger Station]].';
		group = groups.mushroomFloors;
	} else if (cat.includes('pumpkin')) {
		unlock = 'Purchasing [[Optical Disks#Pumpkin_Patch_Optical_Disk|Pumpkin Floors]] from a [[Ranger Station]].';
		group = groups.pumpkinFloors;
	}

	// icon
	if (building.IconSoft) {
		ue.extractIcon(building.IconSoft.AssetPathName, name);
	}

	// console.log({ name, desc, health, cozy, cozyPlus, unlock, components });
	group.push(wiki.tableRow([
		`[[File:${name}.png|50px]]<br>${name}`,
		health,
		cozy,
		cozyPlus,
		`${wiki.italic(`"${desc}"`)}\n\n${wiki.bold(`Unlocked by:`)} ${unlock}`,
		components.join('<br>'),
	]));
});

// table
const tableHeaderTop = wiki.tableHeader([
	{
		attrs: {
			rowspan: 2,
		},
		content: 'Building',
	},
	{
		attrs: {
			colspan: 3,
			class: 'unsortable',
		},
		content: 'Stats',
	},
	{
		attrs: {
			rowspan: 2,
			class: 'unsortable',
		},
		content: 'Description',
	},
	{
		attrs: {
			rowspan: 2,
			class: 'unsortable',
		},
		content: 'Crafting Components',
	},
]);

const tableHeaderBottom = wiki.tableHeader([
	{
		attrs: {
			class: 'unsortable',
		},
		content: 'Health',
	},
	{
		attrs: {
			class: 'unsortable',
		},
		content: 'Coziness',
	},
	{
		attrs: {
			class: 'unsortable',
		},
		content: 'Duplicate Coziness',
	},
]);

Object.keys(groups).forEach(key => {
	// console.log(wiki.title('Floors', 3));

	const table = wiki.table([tableHeaderTop, tableHeaderBottom, ...groups[key]], {
		sortable: true,
		styles: {
			textAlign: 'center',
		}
	});

	// console.log(table);
});

wiki.timestamp();
