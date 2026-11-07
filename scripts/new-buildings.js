import fs from 'node:fs';
import text from '../utils/text.js';
import ue from '../utils/ue.js';
import wiki from '../utils/wiki.js';

const removeHtml = (string = '') =>
	`${string}`.replaceAll(/<[^>]+>/g, '');

const buildings = ue.parsePathData('/Game/Blueprints/Items/Table_AllBuildings.0').Rows || {};
const recipes = ue.parsePathData('/Game/Blueprints/Items/Table_BuildingRecipes.0').Rows || {};

const keys = [
	'StorageCentipedeApothecary',
];

let groups = {
	// mushroomFloors: [],
	// pumpkinFloors: [],
}

const categories = ue.parsePathData('/Game/_Augusta/UI/DataAssets/DA_BuildingSubCategories_Playgrounds.0').Properties.Categories || [];

Object.keys(buildings).forEach(key => {

	// keys.forEach(key => {
	// debug
	// if (!key.toLocaleLowerCase().includes('sturdy')) return;

	// objects
	const building = buildings[key];
	const recipe = recipes[key];

	// strings
	const name = removeHtml(text.getStringFromTable(building.LocalizedDisplayName))
		.replaceAll(/\bInt\./gi, 'Interior')
		.replaceAll(/\bSq\./gi, 'Squared');
	const desc = removeHtml(text.getStringFromTable(building.LocalizedDescription));

	// if (!name.toLocaleLowerCase().includes('centipede')) return;
	// if (!keys.includes(key)) return;

	// placement data - PlacementData.Actor.AssetPathName
	const [bpPath] = building.PlacementData.Actor.AssetPathName.split('.');
	let blueprint = {};
	if (bpPath) {
		blueprint = JSON.parse(fs.readFileSync(`data/${bpPath}.json`, 'utf-8')).find(({ Type }) => Type === 'HealthComponent');
	}

	let health;
	if (blueprint && Object.hasOwn(blueprint, 'Properties') && Object.hasOwn(blueprint.Properties, 'MaxHealth')) {
		health = blueprint.Properties.MaxHealth;
	} else if (blueprint && Object.hasOwn(blueprint, 'Template') && Object.hasOwn(blueprint.Template, 'ObjectPath')) {
		const template = ue.parsePathData(blueprint.Template.ObjectPath || '');
		if (Object.hasOwn(template, 'Properties') && Object.hasOwn(template.Properties, 'MaxHealth')) {
			health = template.Properties.MaxHealth;
		}
	}

	// cozy data
	const cozy = building.CozinessContribution;
	const cozyPlus = building.CozinessAdditionalContribution;

	// recipe
	let components = [];
	if (recipe && recipe.Requirements && recipe.Requirements.length > 0) {
		components = recipe.Requirements.map(({ Item = {}, ItemCount = 0 }) => {
			let itemName = Item.RowName;
			if (Object.hasOwn(Item, 'DataTable') &&
				Object.hasOwn(Item, 'RowName')) {
				itemName = text.getStringFromTable(ue.getDataTableItem(Item).LocalizedDisplayName);
			}

			return `${ItemCount} ${wiki.icon(itemName)}`;
		});
	}

	// category - for manually writing unlock req
	// TODO: replace with something that looks for resource/brainpower/cozy/ranger unlocks
	const cat = building.PlacementData.UGCSubcategoryTag.TagName.toLowerCase() || 'misc';
	let unlock = '';
	if (!Object.hasOwn(groups, cat)) {
		groups[cat] = [];
	}

	if (cat.includes('mushroom')) {
		unlock = 'Purchasing [[Optical Disks#Gnarly_Bark_Aquatic_Optical_Disk|Mushroom Floors]] from a [[Ranger Station]].';
		// group = groups.mushroomFloors;
	} else if (cat.includes('pumpkin')) {
		unlock = 'Purchasing [[Optical Disks#Pumpkin_Patch_Optical_Disk|Pumpkin Floors]] from a [[Ranger Station]].';
		// group = groups.pumpkinFloors;
	}

	// icon
	if (building.IconSoft && building.IconSoft.AssetPathName) {
		if (building.ModIconSoft && building.ModIconSoft.AssetPathName) {
			console.log('ModIconSoft', key);
		}
		if (building.IconSoft.AssetPathName.includes('S_Trigger')) {
			console.log('S_Trigger', key);
		}
		ue.extractIcon(building.IconSoft.AssetPathName, name, building.ModIconSoft?.AssetPathName || '');
	}

	// console.log({ name, desc, health, cozy, cozyPlus, unlock, components });
	groups[cat].push(wiki.tableRow([
		`[[File:${name}.png|50px]]<br>${name}<br>(${key})`,
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
		attributes: {
			rowspan: 2,
		},
		content: 'Building',
	},
	{
		attributes: {
			colspan: 3,
			class: 'unsortable',
		},
		content: 'Stats',
	},
	{
		attributes: {
			rowspan: 2,
			class: 'unsortable',
		},
		content: 'Description',
	},
	{
		attributes: {
			rowspan: 2,
			class: 'unsortable',
		},
		content: 'Crafting Components',
	},
]);

const tableHeaderBottom = wiki.tableHeader([
	{
		attributes: {
			class: 'unsortable',
		},
		content: 'Health',
	},
	{
		attributes: {
			class: 'unsortable',
		},
		content: 'Coziness',
	},
	{
		attributes: {
			class: 'unsortable',
		},
		content: 'Duplicate Coziness',
	},
]);

Object.keys(groups).forEach(key => {
	const catObj = categories.find(({ Key: { TagName } }) => TagName.toLowerCase() === key);
	const catName = text.getStringFromTable(catObj?.Value?.CategoryName || {}) || key;

	console.log(wiki.title(catName, 3));

	const table = wiki.table([tableHeaderTop, tableHeaderBottom, ...groups[key]], {
		styles: {
			textAlign: 'center',
		},
		sortable: true,
	});

	console.log(table);
});

wiki.timestamp();
