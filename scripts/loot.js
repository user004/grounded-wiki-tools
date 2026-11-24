import ue from '../utils/ue.js';
import text from '../utils/text.js';
import wiki from '../utils/wiki.js';

/* TODO: figure this out later
const creatures = ue.parsePathData('/Game/Blueprints/DataTables/Table_Bestiary.0').Rows || {};

Object.keys(creatures).forEach(key => {
	// TODO: make this use a param?
	if (key !== 'TermiteNymph') return;

	const row = creatures[key];
	console.log(row);
	const creature = ue.getAssetPathItem(row.Creature);
	console.log(creature.ChildProperties.find(({ Name }) => Name.includes('LootComponent')));

});
*/

const creatureLoot = ue.getAssetPathItem({ AssetPathName: '/Game/Releases/Release_0_6_0/Blueprints/Creatures/Termites/BP_Termite_Nymph_Augusta.Loot_GEN_VARIABLE' });
creatureLoot.Properties.Items.forEach(item => {
	const itemObject = ue.getDataTableItem(item.ItemData);
	const itemName = text.getStringFromTable(itemObject.LocalizedDisplayName);

	const {
		Type,
		Count,
		DropChance,
		bIgnoreLuck,
		bStealable,
	} = item;
	console.log({
		itemName,
		// Type,
		Count,
		DropChance,
		bIgnoreLuck,
		bStealable,
	});
});
