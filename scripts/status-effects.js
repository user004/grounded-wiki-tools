import fs from 'fs';
import constants from '../utils/constants.js';
import text from '../utils/text.js';
import ue from '../utils/ue.js';
import wiki from '../utils/wiki.js';

let statusGroups = {
	positive: {
		weapons: [],
		armor: {
			piece: [],
			class: [],
			sleek: [],
			sets: [],
		},
		consumables: [],
		trinkets: [],
		mutations: [],
		misc: [],
	},
	negative: {
		armor: [],
		consumables: [],
		trinkets: [],
		misc: [],
	},
};

const fixDescription = (description = '') => {
	let replaced = description;

	try {
		replaced = description.replaceAll(/<[^>]*>/g, '')
	} catch (error) {
		console.error(error);
	}

	return replaced;
}

const listReadable = (list) => {
	switch (list.length) {
		case 1:
			return `a ${list.join()}`;

		case 2:
			return list.join(' or ');

		// 3+
		default:
			const lastItem = list.pop();
			return `${list.join(', ')}, or ${lastItem}`;
	}
}

const translateDetails = (effect) => {
	// TODO: add more
	switch (effect.Type) {
		case 'EStatusEffectType::AttackDamage':
			return `Increases damage ${effect.Value} for ${effect.Duration}.`;

		case 'EStatusEffectType::PerfectBlockTime':
			return `Extends perfect block timing by ${effect.Value}s for ${effect.Duration}.`;

		case 'EStatusEffectType::TriggerExtraAttack':
			if (effect.key === 'ComboFinishParryWindow' ||
				effect.key === 'ComboFinishParryWindowProc' ||
				effect.key === 'CoaltanaParryAttackIncrease'
			) {
				console.log(effect.key, effect);
			}

			return `Deals ${effect?.DamageData?.Damage} ${effect?.DamageData?.damageType} damage on ${listReadable(effect.DamageSourceTags)}`;

		default:
			return 'DETAILS GO HERE';
	}
};

const getStatusDetailsNew = (dataTableObject) => {
	const hasDataTable = Object.hasOwn(dataTableObject, 'DataTable') && dataTableObject.DataTable;
	const hasObjectPath = hasDataTable && Object.hasOwn(dataTableObject.DataTable, 'ObjectPath');
	const hasRowName = Object.hasOwn(dataTableObject, 'RowName') && dataTableObject.RowName !== 'None';

	if (!hasDataTable || !hasObjectPath || !hasRowName) return null;// TODO: what return?

	// if (dataTableObject.DataTable.ObjectName.includes('DT_StatusEffects')) return;

	// 1682 total, 383 have ExtraData
	const itemPaths = [
		'AllAttacks',// 181
		'CDT_PerceptionRangeMultipliers',// 1
		'CDT_ProximityTriggers',// 4
		'CreatureAttacks',// 3
		'Table_StatusEffects',// 181
		'Table_Teams',// 13
	];

	const setPaths = [
		'Table_StatusEffects',// 60
	];

	const perPaths = [
		'Table_StatusEffects',
		'Table_StatusEffects_4',
		'Table_StatusEffects_BuggyMutations5',
	];


	const pathMatches = itemPaths.any(path => dataTableObject.DataTable.ObjectPath.contains(path));
	if (!pathMatches) return null;// TODO: still don't know what to do?


	// DisplayData - Name/Description

	// things I want
	const needKeys = [
		'Type',
		'Value',
		'DurationType',
		'Duration',
		'Interval',
		'MaxStackCount',
		'DamageTypeFlags',
		'DamageType',
		'AttackChargeType',
		'DamageSourceTags',
		'ExtraData',// most of the actual info
		'bIsNegativeEffectInUI',
	];

	// unsure what these do
	const unknownKeys = [
		'ApplicationTags',
		'EffectTags',
		'BlockingDamageSourceTags',
		'DamageTargetTags',
		'BlockingDamageTargetTags',
		'UniqueTag',
		'BlockTags',
		'RequiredTags',
		'ApplyType',
		'AttackChargeType',// EStatusEffectAttackChargeType::[Charged|Default|Uncharged]
		'ClearFlags',// bitwise flag
		'SpawnedActor',
		'ScreenEffectData',
		'ActivationVFX',
		'ActivationSFXAttached',
		'ActivationSFXAtLocation',
		'bShowInUI',// not sure if care
		'bTickWhileMounted',
	];

	// confirmed all the same, don't need... yet
	const unusedKeys = [
		'DisplayData',// not in the loop at least
		'RequiredTagsToTakeEffect',
		'AttackItemOwner',
		'DeactivationVFX',
		'DeactivationSFXAttached',
		'DeactivationSFXAtLocation',
		'Anim',
		'ActorSpawnParameters',
	];



};

const getStatusDetails = (key, statusObject) => {
	const name = text.getStringFromTable(statusObject.DisplayData?.Name) || key;
	const description = text.getStringFromTable(statusObject.DisplayData?.Description);

	if (key === 'ComboFinishParryWindowProc' || key === 'CoaltanaParryAttackIncrease') {
		// console.log();
	}

	const flatKeys = [
		'Type',
		'Value',
		'DurationType',
		'Duration',
		'Interval',
		'MaxStackCount',
		'DamageTypeFlags',
		'DamageType',
		'AttackChargeType',
		'DamageSourceTags',
	];

	let statusData = {
		key,
		name,
		description,
	};

	flatKeys.forEach(key => {
		// if (statusData.key === 'ComboFinishParryWindow') console.log(key, statusObject[key], !!statusObject[key]);
		if (!Object.hasOwn(statusObject, key) || !statusObject[key]) return;

		switch (key) {
			case 'DamageTypeFlags':
				// if (statusData.key === 'ComboFinishParryWindow') console.log(statusObject[key]);
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

	let extraData;
	if (statusObject.ExtraData && statusObject.ExtraData.DataTable) {
		extraData = ue.getDataTableItem(statusObject.ExtraData) || {};

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
			// TODO: maybe don't need to figure this out?
			if (Array.isArray(extraData[objKey]) && extraData[objKey].length > 0) {
				extraData[objKey].forEach(data => {
					if (Object.hasOwn(data, 'DataTable') &&
						Object.hasOwn(data, 'RowName')) {
						const extraArrayData = ue.getDataTableItem(data);

						const subStatusData = getStatusDetails(data.RowName, extraArrayData);
						for (let [key, value] of Object.entries(subStatusData)) {
							if (key === 'key') continue;
							statusData[key] = value;
						}
					} else {
						statusData[objKey] = data;
					}
				});
			}

			if (!Object.hasOwn(extraData, objKey)) return;

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
							if (damageKey === 'StatusEffects') {
								const statusObject = ue.getDataTableItem(status);
								const statusName = text.getStringFromTable(statusObject.DisplayData?.Name);
								// if (key === 'ComboFinishParryWindow') console.log(statusObject)
								return `${status.RowName}: ${getStatusDetails(status.RowName, statusObject).name}`;
							} else {

								if (Object.hasOwn(status, 'DataTable')) {
									const statusObject = ue.getDataTableItem(status);
									return text.getStringFromTable(statusObject.DisplayData?.Name);
								} else if (Object.hasOwn(status, 'HazardClass')) {
									const [hazardPath, hazardKey] = status.HazardClass.AssetPathName.split('.');
									const hazardArray = JSON.parse(fs.readFileSync(`data${hazardPath}.json`, 'utf-8'));
									const hazardObject = hazardArray.find(({ Type }) => Type === hazardKey);
									// TODO: figure this out
								}
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
						damageLoop.damageType = text.getStringFromTable(damageTypeClassDefaultObject.Properties?.LocalizedDisplayName);
					}
				}
			}

			if (Object.keys(damageLoop).length > 0 && (
				Object.hasOwn(damageLoop, 'Damage') ||
				Object.hasOwn(damageLoop, 'HitStun') ||
				Object.hasOwn(damageLoop, 'PoiseDamage') ||
				Object.hasOwn(damageLoop, 'Pushback') ||
				// TODO: replace with hasEffectArray
				hasEffectArray(damageLoop) ||
				hasEffectArray(damageLoop, 'StatusEffectsToApply')
			)) {
				statusData[objKey] = damageLoop;
			} else {
				// TODO: what is this?
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

const hasEffectArray = (object, key = 'StatusEffects') =>
	Object.hasOwn(object, key) &&
	Array.isArray(object[key]) &&
	object[key].length > 0;

const getMagnetism = (bool) => bool ? 'negative' : 'positive';

/* items - weapons, armor-piece, armor-class, armor-sleek, trinkets, consumables
Table_Allitems
	Rows
		ItemKey
			EquippableData
				StatusEffects[]
					-> DataTable
				HiddenStatusEffects[]
					-> DataTable
			ConsumableData[]
				-> DataTable
					StatusEffects[]
*/
const allItems = ue.parsePathData('/Game/Blueprints/Items/Table_AllItems.0').Rows || {};
Object.values(allItems).forEach(item => {
	// skip key items
	if ([
		'EItemType::PartyKeyItem',
		'EItemType::PersonalKeyItem',
	].includes(item.ItemType)) return;

	const itemName = text.getStringFromTable(item.LocalizedDisplayName);
	if (!itemName) return;

	const hasEquipableData = Object.hasOwn(item, 'EquippableData');
	const hasStatusEffects = hasEquipableData && hasEffectArray(item.EquippableData);
	const hasHiddenStatusEffects = hasEquipableData && hasEffectArray(item.EquippableData, 'HiddenStatusEffects');
	const hasConsumableData = hasEffectArray(item, 'ConsumableData');

	// skip if doesn't have one of these fields
	if (!hasStatusEffects &&
		!hasHiddenStatusEffects &&
		!hasConsumableData) {
		return;
	}

	if (hasStatusEffects) {
		item.EquippableData.StatusEffects.forEach(statusTable => {
			// skip dev tables
			if (statusTable.DataTable.ObjectName.includes('DT_StatusEffects')) return;

			// skips?
			// Fertilizer
			// BugTreat

			const statusObject = ue.getDataTableItem(statusTable);
			const statusDetails = getStatusDetails(statusTable.RowName, statusObject);

			let magnetism = getMagnetism(statusObject.bIsNegativeEffectInUI);

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
	}

	if (hasHiddenStatusEffects) {
		item.EquippableData.HiddenStatusEffects.forEach(statusTable => {
			// skip dev tables
			if (statusTable.DataTable.ObjectName.includes('DT_StatusEffects')) return;

			const statusObject = ue.getDataTableItem(statusTable);
			const statusDetails = getStatusDetails(statusTable.RowName, statusObject);

			let magnetism = getMagnetism(statusObject.bIsNegativeEffectInUI);

			// random negative but actually positive things
			if ([
				// TODO: still need  this?
			].includes(statusTable.RowName)) {
				magnetism = 'positive';
			}

			// determine path to groups object
			let groupObject = statusGroups[magnetism];

			switch (item.Slot) {
				// weapon
				case 'EEquipmentSlot::MainHand':
				case 'EEquipmentSlot::OffHand':
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
					groupObject = groupObject.misc;
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
	}

	if (hasConsumableData) {
		item.ConsumableData.forEach(consumableData => {
			// ConsumableEffects
			const consumableObject = ue.getDataTableItem(consumableData);
			const consumableEffects = [];
			if (hasEffectArray(consumableObject, 'ConsumableEffects')) {
				consumableEffects.push(...consumableObject.ConsumableEffects);
			} else if (hasEffectArray(consumableObject)) {
				consumableEffects.push(...consumableObject.StatusEffects);
			}

			consumableEffects.forEach(statusTable => {
				if (statusTable.DataTable.ObjectName.includes('DT_StatusEffects')) return;

				const statusObject = ue.getDataTableItem(statusTable);
				const statusDetails = getStatusDetails(statusTable.RowName, statusObject);

				let magnetism = getMagnetism(statusObject.bIsNegativeEffectInUI);

				// random negative but actually positive things
				if ([
					// TODO: still need  this?
				].includes(statusTable.RowName)) {
					magnetism = 'positive';
				}

				// determine path to groups object
				let groupObject = statusGroups[magnetism].consumables;

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
			})
		});
	}
});

/* sets
Table_Itemsets
	Rows
		SetKey
			StatusEffects[]
				-> DataTable
*/
const allSets = ue.parsePathData('/Game/Blueprints/Items/ItemTables/Table_ItemSets.0').Rows || {};
Object.values(allSets).forEach(set => {
	if (!hasEffectArray(set)) return;

	set.StatusEffects.forEach(statusTable => {
		// skip dev tables
		if (statusTable.DataTable.ObjectName.includes('DT_StatusEffects')) return;

		const statusObject = ue.getDataTableItem(statusTable);
		const statusDetails = getStatusDetails(statusTable.RowName, statusObject);

		let magnetism = getMagnetism(statusObject.bIsNegativeEffectInUI);

		// random negative but actually positive things
		if ([
			// TODO: still need  this?
		].includes(statusTable.RowName)) {
			magnetism = 'positive';
		}

		// determine path to groups object
		let groupObject = statusGroups[magnetism].armor.sets;

		const existingId = groupObject.findIndex(temp =>
			temp.key === statusTable.RowName);
		if (existingId !== -1) {
			// already there
			const existingObject = groupObject[existingId];
			existingObject.source.push(statusTable.RowName)
			groupObject[existingId] = existingObject;
		} else {
			statusDetails.source = [statusTable.RowName];
			groupObject.push(statusDetails);
		}
	});
});

/* mutations
Table_Perks
	Rows
		PerkKey
			Tiers[]
				Reward
					StatusEffects[]
						-> DataTable
*/
const allMutations = ue.parsePathData('/Game/Design/Perks/Table_Perks.0')?.Rows || [];
Object.values(allMutations).forEach(mutation => {
	if (!hasEffectArray(mutation, 'Tiers')) return;

	const mutationName = text.getStringFromTable(mutation.LocalizedDisplayName);
	if (!mutationName) return;

	mutation.Tiers.flatMap(tier => tier.Reward).forEach(tier => {
		if (!hasEffectArray(tier)) return;

		tier.StatusEffects.forEach(statusTable => {
			// skip dev tables
			if (statusTable.DataTable.ObjectName.includes('DT_StatusEffects')) return;

			const statusObject = ue.getDataTableItem(statusTable);
			const statusDetails = getStatusDetails(statusTable.RowName, statusObject);

			let magnetism = getMagnetism(statusObject.bIsNegativeEffectInUI);

			// random negative but actually positive things
			if ([
				// TODO: still need  this?
			].includes(statusTable.RowName)) {
				magnetism = 'positive';
			}

			// determine path to groups object
			let groupObject = statusGroups[magnetism].mutations;

			const existingId = groupObject.findIndex(temp =>
				temp.key === statusTable.RowName);
			if (existingId !== -1) {
				// already there
				const existingObject = groupObject[existingId];
				existingObject.source.push(mutationName)
				groupObject[existingId] = existingObject;
			} else {
				statusDetails.source = [mutationName];
				groupObject.push(statusDetails);
			}
		});
	});
});


const sortEffects = (a, b) => {
	if (a.name < b.name) return -1;
	if (a.name > b.name) return 1;
	return 0;
};

const tableHeader = wiki.tableHeader([
	{
		styles: {
			width: '10%',
		},
		attributes: {
			class: 'unsortable',
		},
		content: 'Effect',
	},
	{
		styles: {
			width: '35%',
		},
		attributes: {
			class: 'unsortable',
		},
		content: 'Details',
	},
	{
		styles: {
			width: '35%',
		},
		attributes: {
			class: 'unsortable',
		},
		content: 'In-Game Description',
	},
	{
		styles: {
			width: '20%',
		},
		content: 'Source',
	}
]);

const recurseStatusGroups = (statusGroup, tier = 1) => {
	for (let [key, value] of Object.entries(statusGroup)) {
		console.log(wiki.title(key, tier));

		if (Array.isArray(value)) {
			const statusRows = value.sort(sortEffects).map(effect => {
				// TODO: testing
				// if (effect.Type !== 'EStatusEffectType::TriggerExtraAttack') return null;

				return wiki.tableRow([
					{
						styles: {
							textAlign: 'center',
						},
						content: `<span id="${effect.key}">[[File:${effect.name}.png|50px]]</span><br>${effect.name}`,
					},
					// translateDetails(effect),
					// '-',
					wiki.list(effect?.DamageData?.StatusEffects || []),
					fixDescription(effect.description || ''),
					wiki.list(effect.source.sort().map(item => wiki.link(item))),
				]);
			}).filter(item => item !== null);

			const statusTable = wiki.table([tableHeader, ...statusRows], {
				sortable: true,
				collapsible: true,
			});

			console.log(statusTable);

		} else {
			recurseStatusGroups(value, tier + 1);
		}
	}
}

recurseStatusGroups(statusGroups);

wiki.timestamp();
