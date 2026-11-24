import ue from '../utils/ue.js';

const creatures = ue.parsePathData('/Game/Blueprints/DataTables/Table_Bestiary').Rows || {};

Object.keys(creatures).map(creatureKey => {
	console.log(`${creatureKey}: ${creatures[creatureKey].RareDropChance * 100}%`);
});
