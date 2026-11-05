const CONSTANTS = {
	appData: 'data',
	// TODO: something about this slash, always resolve or...?
	appOutput: 'output/',

	// class statuses
	classStatuses: {
		'Fighter Armor': 'FighterFinisherStun',
		'Mage Armor': 'MageStaffStaminaReduction',
		'Ranger Armor': 'RangerWeakPointDamage',
		'Rogue Armor': 'RogueFinisherCriticals',
	},

	// weapon statuses
	weaponStatuses: {
		'Bow': 'WeaponBow',
		'Club': 'WeaponClub',
		'Dagger': 'WeaponDagger',
		'Fist': 'WeaponFist',
		'Spear': 'WeaponSpear',
		'Sword': 'WeaponSword',
	},

	// table ID names
	tableIdToString: {
		1: 'game/gui',
		2: 'game/items',
		9: 'game/characters',
		22: 'game/buildings',
		29: 'game/techtree',// AKA optical disks
		33: 'game/statuseffects',
		56: 'game/pointsofinterest',
		193: 'game/burglequests',// AKA ranger challenges
		195: 'game/perks',// AKA mutations
		// TODO: add more
		/* remaining in alphabetical order
		game/areas
		game/chatwheel
		game/cutscene
		game/dataitems
		game/deathmessages
		game/gizmos
		game/harvestnodes
		game/inputbindings
		game/news
		game/props
		game/quests
		game/tutorial
		*/
	},

	// damgage type bitmasks
	damageTypeFlags: {
		1: 'General',
		2: 'Chopping',
		4: 'Mining',
		8: 'Stabbing',
		16: 'Digging',
		32: 'Gas',
		64: 'Chill',
		128: 'Slashing',
		256: 'Burning',
		512: 'Explosive',
		1024: 'Shock',
		2048: 'Salty',
		4096: 'Spicy',
		8192: 'Acid',
		131072: 'Sour',
		2097152: 'Freeze',
		4194304: 'Venom',
		8388608: 'Water',
		/* remaining?
		16384: '',
		32768: '',
		65536: '',
		262144: '',
		524288: '',
		4194304: '',
		*/
	},

	// TODO: dunno if this is actually bitwise or just flags
	placementTypeFlags: {
		1: 'Land',
		2: 'Water-Level',// buoyant foundations, water-level?
		// 3: 2+1 land and water-level? trail marker only item
		4: 'Underwater',
		// 5: 4+1 underwater and land?
		// 6: 4+2 underwater and water-level? buotant trail marker only item
		// 7: land, water-level, and underwatcher
	},

};

/**
 * Gets a named constant from the shared constants map.
 * @param {string} constant - Name of the constant to retrieve.
 * @returns {object} The constant value, or an empty object if it is not defined.
 */
const getConstant = (constant) => CONSTANTS[constant] || {};

export default { getConstant };
