import fs from 'node:fs';
import ue from '../utils/ue.js';
import text from '../utils/text.js';
import wiki from '../utils/wiki.js';

const creatures = ue.parsePathData('/Game/Blueprints/DataTables/Table_Bestiary.0').Rows || [];

for (let [key, creature] of Object.entries(creatures)) {
	// skip others for now
	if (key !== 'StripedBarkScorpionAdultORC') continue;
	console.log(key);

	// TODO: extract to function?
	const pathParts = creature.Creature.AssetPathName.split('.');
	const creatureObject = JSON.parse(fs.readFileSync(`data${pathParts[0]}.json`, 'utf-8'))
		.find(object => object.Type === pathParts[1]);

	const lootObject = JSON.parse(fs.readFileSync(`data${pathParts[0]}.json`, 'utf-8'))
		.find(object => object.Type === 'LootComponent');

	let creatureData = {
		health: null,
		goldCard: creature.RareDropChance,// TODO: make percent format function?
		loot: [],
		weakpoints: creature.WeakpointTags,// TODO: find string values?
	}

	for (let [key, property] of Object.entries(creatureObject.Properties)) {
		let propObject = {};
		if (Object.hasOwn(property, 'ObjectPath')) {
			propObject = ue.parsePathData(property.ObjectPath);
		}

		switch (key) {
			case 'AbilityDataList':
				// console.log('ability');
				property.forEach(prop => {
					const abilityData = ue.getDataTableItem(prop);
					// console.log(abilityData);
				});

				break;

			case 'HealthComponent':
				// console.log('health', propObject.Properties.MaxHealth);
				creatureData.health = propObject.Properties.MaxHealth;
				break;

			case 'StatusEffectComponent':
				// console.log('statuseffect');
				propObject.Properties.DefaultStatusEffects.forEach(status => {
					const statusData = ue.getDataTableItem(status);
					// console.log(statusData);
				})

				break;
		}
	}

	const templateObject = ue.parsePathData(lootObject.Template.ObjectPath);
	const templateLoot = templateObject.Properties.Items.map(lootItem => {
		const itemObject = ue.getDataTableItem(lootItem.ItemData);

		let itemName = '';
		if (itemObject && Object.hasOwn(itemObject, 'LocalizedDisplayName')) {
			itemName = text.getStringFromTable(itemObject.LocalizedDisplayName);
		} else {
			const pathParts = lootItem.ActorToSpawn.AssetPathName.split('.');

			const creatureObject = JSON.parse(fs.readFileSync(`data${pathParts[0]}.json`, 'utf-8'))
				.find(object => object.Type === pathParts[1]);

			const templateObject = ue.parsePathData(creatureObject.Template.ObjectPath);

			const combinedProps = ue.deepMerge(templateObject.Properties, creatureObject.Properties);

			itemName = text.getStringFromTable(combinedProps.CharacterName);
		}

		return {
			name: itemName,
			qty: lootItem.Count || null,
			chance: lootItem.DropChance || null,
		};
	});

	const creatureLoot = lootObject.Properties.Items.map(lootItem => {
		const itemObject = ue.getDataTableItem(lootItem.ItemData);

		let itemName = '';
		if (itemObject && Object.hasOwn(itemObject, 'LocalizedDisplayName')) {
			itemName = text.getStringFromTable(itemObject.LocalizedDisplayName);
		} else {
			const pathParts = lootItem.ActorToSpawn.AssetPathName.split('.');

			const creatureObject = JSON.parse(fs.readFileSync(`data${pathParts[0]}.json`, 'utf-8'))
				.find(object => object.Type === pathParts[1]);

			const templateObject = ue.parsePathData(creatureObject.Template.ObjectPath);

			const combinedProps = ue.deepMerge(templateObject.Properties, creatureObject.Properties);

			itemName = text.getStringFromTable(combinedProps.CharacterName);
		}

		const lootData = {
			name: itemName,
			qty: lootItem.Count || null,
			chance: lootItem.DropChance || null,
		};

		if (templateLoot.some(old => JSON.stringify(old) === JSON.stringify(lootData))) {
			return;
		}

		return {
			name: itemName,
			qty: lootItem.Count || null,
			chance: lootItem.DropChance || null,
		}
	})
		// remove empties
		.filter(filter => filter !== undefined);

	creatureData.loot = [...templateLoot, ...creatureLoot];

	console.log(creatureData);
}

wiki.timestamp();
