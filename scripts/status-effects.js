import fs from 'fs';
import constants from '../utils/constants.js';
import text from '../utils/text.js';
import ue from '../utils/ue.js';

const allTables = text.getAllTables();

let statusGroups = {
	positive: {
		weapons: [],
		armor: {
			piece: [],
			class: [],
			sleek: [],// HiddenStatusEffects
			sets: [],
		},
		consumables: [],
		trinkets: [],
		mutations: [],
		misc: [],
	},
	negative: {
		weapons: [],// not needed?
		armor: [],
		consumables: [],
		trinkets: [],
		misc: [],
	},
};

// weapons, armor-piece, armor-class, armor-sleek, trinkets, consumables
const allItems = ue.parsePathData('/Game/Blueprints/Items/Table_AllItems.0').Rows || {};

// sets
const allSets = ue.parsePathData('/Game/Blueprints/Items/ItemTables/Table_ItemSets.0').Rows || {};

// mutations
// /Game/Design/Perks/Table_Perks.0

// const getDamageDetails = () => { };

const getStatusDetails = (key, statusObject) => {
	if (statusObject === undefined) {
		console.log({ key, statusObject });
	}

	const name = text.getStringFromTable(allTables, statusObject.DisplayData?.Name);
	const description = text.getStringFromTable(allTables, statusObject.DisplayData?.Description);

	const flatKeys = [
		'Type',
		'Value',
		'DurationType',
		'Duration',
		'Interval',
		'MaxStackCount',
		'DamageTypeFlags',
		'DamageType',
	];

	let statusData = {
		key,
		name,
		description,
	};

	flatKeys.forEach(key => {
		if (!Object.hasOwn(statusObject, key) || !statusObject[key]) return;

		switch (key) {
			case 'DamageTypeFlags':
				statusData.DamageTypes = ue.getDamageTypes(statusObject[key]);
				break;

			default:
				statusData[key] = statusObject[key];
		}
	});

	/* confirmed don't need... yet
		AttackItemOwner
		DeactivationVFX
		DeactivationSFXAttached
		DeactivationSFXAtLocation
		ActorSpawnParameters
	*/

	// TODO: figure this out
	// if (key === 'ArmorAntSet') console.log(statusObject.ExtraData);

	let extraData;
	if (statusObject.ExtraData.DataTable) {
		extraData = ue.getDataTableItem(statusObject.ExtraData) || {};
		if (key === 'ArmorAcornSet') console.log({ extraData });

		const objKeys = [
			'DamageData',
			'DamageDataSecondary',// TODO: player items don't appear to have them?
			'ChargedDamageData',
			'PerfectChargedDamageData',
			// for set effects?
			'StatusEffectsToApply',
			'ApplyToCharactersWithAnyOfTheseTags',
			'DontApplyToCharactersWithAnyOfTheseTags',
		];

		let damageObjects = [];
		objKeys.forEach(objKey => {
			// if (objKey === 'DamageDataSecondary') console.log(objKey, extraData[objKey]);
			// TODO: maybe don't need to figure this out?
			if (Array.isArray(extraData[objKey]) && extraData[objKey].length > 0) {
				// console.log('isArray with stuff in it!')
				// console.log(key, objKey, extraData[objKey].length);
				extraData[objKey].forEach(data => {
					if (Object.hasOwn(data, 'DataTable') &&
						Object.hasOwn(data, 'RowName')) {
						const extraArrayData = ue.getDataTableItem(data);
						// console.log({ extraArrayData });

						const subStatusData = getStatusDetails(data.RowName, extraArrayData);
						for (let [key, value] of Object.entries(subStatusData)) {
							// console.log({ key, value });
							if (key === 'key') continue;
							statusData[key] = value;
						}
						// console.log(statusData);
					} else {
						statusData[objKey] = data;
					}
				});
			}

			if (!Object.hasOwn(extraData, objKey)) return;
			// console.log(objKey);

			const damageKeys = [
				'Damage',
				'DamageEventType',
				'ForcedHitReaction',
				'Hazards',
				'HitStun',
				'PoiseDamage',
				'Pushback',
				'StatusEffectApplyType',
				'StatusEffects',
				'StatusEffectTypeApplySelf',
			]

			let damageLoop = {};
			damageKeys.forEach(damageKey => {
				if (Object.hasOwn(extraData[objKey], damageKey) &&
					extraData[objKey][damageKey] &&
					extraData[objKey][damageKey] !== 'EStatusEffectType::None') {
					// TODO: need to figure out status effect array instead of just including it
					if (Array.isArray(extraData[objKey][damageKey]) && extraData[objKey][damageKey].length > 0) {
						damageLoop[damageKey] = extraData[objKey][damageKey].map(status => {
							if (Object.hasOwn(status, 'DataTable')) {
								const statusObject = ue.getDataTableItem(status);
								return text.getStringFromTable(allTables, statusObject.DisplayData?.Name);
							} else if (Object.hasOwn(status, 'HazardClass')) {
								// console.log({ key, objKey, damageKey, status });
								const [hazardPath, hazardKey] = status.HazardClass.AssetPathName.split('.');
								const hazardArray = JSON.parse(fs.readFileSync(`data${hazardPath}.json`, 'utf-8'));
								const hazardObject = hazardArray.find(({ Type }) => Type === hazardKey);
								// console.log(hazardObject.Properties);
								// TODO: figure this out
							}

							return '';
						});
					} else {
						damageLoop[damageKey] = extraData[objKey][damageKey];
					}
				}
			});

			// DamageType.ObjectPath
			let damageTypeName = '';
			if (extraData[objKey].DamageType &&
				extraData[objKey].DamageType.ObjectPath &&
				// TODO: consolidate to "starts with /script?"
				extraData[objKey].DamageType.ObjectPath !== '/Script/Maine' &&
				extraData[objKey].DamageType.ObjectPath !== '/Script/Engine') {
				const damageTypeObject = ue.parsePathData(extraData[objKey].DamageType.ObjectPath);
				if (damageTypeObject.ClassDefaultObject &&
					damageTypeObject.ClassDefaultObject.ObjectPath) {
					const damageTypeClassDefaultObject = ue.parsePathData(damageTypeObject.ClassDefaultObject.ObjectPath);
					if (damageTypeClassDefaultObject) {
						damageLoop.damageType = text.getStringFromTable(allTables, damageTypeClassDefaultObject.Properties?.LocalizedDisplayName);
					}
				}
			}

			if (Object.keys(damageLoop).length > 0 && (
				Object.hasOwn(damageLoop, 'Damage') ||
				Object.hasOwn(damageLoop, 'HitStun') ||
				Object.hasOwn(damageLoop, 'PoiseDamage') ||
				Object.hasOwn(damageLoop, 'Pushback') ||
				(Object.hasOwn(damageLoop, 'StatusEffectsToApply') &&
					Array.isArray(damageLoop.StatusEffectsToApply) &&
					damageLoop.StatusEffectsToApply.length)
			)) {
				statusData[objKey] = damageLoop;
			} else {
				// console.log(damageLoop);
			}
		});
	}

	return statusData;
};

const formatTime = (seconds) => {
	const minutes = seconds / 60;
	if (minutes > 1) return `${minutes}m`;
	return `${seconds}s`;
};

// items
Object.values(allItems).filter(item =>
	(Object.hasOwn(item.EquippableData, 'StatusEffects') &&
		item.EquippableData.StatusEffects.length > 0) ||
	(Object.hasOwn(item.EquippableData, 'HiddenStatusEffects') &&
		item.EquippableData.HiddenStatusEffects.length > 0))
	.forEach(item => {
		const itemName = text.getStringFromTable(allTables, item.LocalizedDisplayName);
		if (!itemName) return;
		// console.log(itemName, item.Slot);
		if (item.ItemType === 'EItemType::PersonalKeyItem') return;

		// is ammo?
		// AmmoAttackReference.RowName !== 'None' - is ammo
		// AmmoAttackData - has ammo
		// AmmoUseStyle - 1: bow?, 6: harpoon, 7: paintball

		item.EquippableData.StatusEffects.forEach(statusTable => {
			// skip dev tables
			if (statusTable.DataTable.ObjectName.includes('DT_StatusEffects')) return;

			// skips?
			// Fertilizer
			// BugTreat

			const statusObject = ue.getDataTableItem(statusTable);
			const statusDetails = getStatusDetails(statusTable.RowName, statusObject);

			let magnetism = statusObject.bIsNegativeEffectInUI ? 'negative' : 'positive';
			// random negative but actually positive things
			if ([
				'PollenSlow',
				'PollenSlowTurret',
			].includes(statusTable.RowName)) {
				magnetism = 'positive';
			}

			// determine path to groups object
			let groupObject = statusGroups[magnetism];

			// skip weapon statues
			const weaponStatuses = Object.values(constants.getConstant('weaponStatuses'));
			if (weaponStatuses.includes(statusTable.RowName)) return;

			const classStatuses = Object.values(constants.getConstant('classStatuses'));
			// manually add ammo to weapons (otherwise none/misc)
			if (item.AmmoAttackReference.RowName !== 'None') {
				groupObject = groupObject.weapons;
			} else if (classStatuses.includes(statusTable.RowName)) {
				// class effect
				groupObject = groupObject.armor.class;
			} else {
				// the rest
				switch (item.Slot) {
					// weapon
					case 'EEquipmentSlot::MainHand':
					case 'EEquipmentSlot::OffHand':
						// console.log('weapon', itemName);
						groupObject = groupObject.weapons;
						break;

					// armor
					case 'EEquipmentSlot::Head':
					case 'EEquipmentSlot::Chest':
					case 'EEquipmentSlot::Legs':
						groupObject = groupObject.armor;
						if (!statusObject.bIsNegativeEffectInUI) {
							groupObject = groupObject.piece;
						}
						break;

					// trinket
					case 'EEquipmentSlot::Glider':
						// console.log('trinkets', itemName);
						groupObject = groupObject.trinkets;
						break;

					// misc? consumable?
					default:
						groupObject = groupObject.misc;
						break;
				}
			}

			const existingId = groupObject.findIndex(temp =>
				temp.key === statusTable.RowName);
			if (existingId !== -1) {
				// already there
				const existingObject = groupObject[existingId];
				existingObject.source.push(itemName)
				groupObject[existingId] = existingObject;
			} else {
				statusDetails.source = [itemName];
				groupObject.push(statusDetails);
			}
		});

		item.EquippableData.HiddenStatusEffects.forEach(statusTable => {
			if (statusTable.DataTable.ObjectName.includes('DT_StatusEffects')) return;

			const statusObject = ue.getDataTableItem(statusTable);
			const statusDetails = getStatusDetails(statusTable.RowName, statusObject);

			let groupObject = statusGroups.positive;
			switch (item.Slot) {
				// weapon
				case 'EEquipmentSlot::MainHand':
				case 'EEquipmentSlot::OffHand':
					// console.log('weapon', itemName);
					groupObject = groupObject.weapons;
					break;

				// armor
				case 'EEquipmentSlot::Head':
				case 'EEquipmentSlot::Chest':
				case 'EEquipmentSlot::Legs':
					groupObject = groupObject.armor.sleek;
					break;

				// misc? consumable?
				default:
					console.log('unknown');
					break;
			}

			const existingId = groupObject.findIndex(temp =>
				temp.key === statusTable.RowName);
			if (existingId !== -1) {
				// already there
				const existingObject = groupObject[existingId];
				existingObject.source.push(itemName)
				groupObject[existingId] = existingObject;
			} else {
				statusDetails.source = [itemName];
				groupObject.push(statusDetails);
			}
		});
	});

// sets
for (let [key, set] of Object.entries(allSets)) {
	// console.log(key, set);

	set.StatusEffects.forEach(statusTable => {
		if (statusTable.DataTable.ObjectName.includes('DT_StatusEffects')) return;

		const statusObject = ue.getDataTableItem(statusTable);
		// why aren't you grabbing
		const statusDetails = getStatusDetails(statusTable.RowName, statusObject);
		statusDetails.source = [statusTable.RowName];

		statusGroups.positive.armor.sets.push(statusDetails);
	});
}

// mutations


// console.log(statusGroups.positive.armor.sets);
