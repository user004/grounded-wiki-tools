import text from '../utils/text.js';
import ue from '../utils/ue.js';
import wiki from '../utils/wiki.js';

const allTables = text.getAllTables();

const mutations = ue.parsePathData('/Game/Design/Perks/Table_Perks.0')?.Rows || [];

/*
DA_PassiveMutationCategories
DA_ActiveMutationCategories
*/

Object.values(mutations).forEach(mutation => {
	const name = text.getStringFromTable(allTables, mutation.LocalizedDisplayName);
	const description = text.getStringFromTable(allTables, mutation.LocalizedDescription);
	const category = mutation.CategoryTag?.TagName;
	const isPassive = mutation.bIsPassive;
	const tiers = mutation.Tiers || [];
	let i = 1;

	if (name !== 'Smasher') return;
	console.group('mutation', { name, description, category, isPassive });

	let effects = [];
	let conditions = [];

	tiers.forEach(tier => {
		const condition = text.getStringFromTable(allTables, tier.Condition?.LocalizedConditionName);
		const description = text.getStringFromTable(allTables, tier.Condition?.LocalizedConditionDescription);
		const value = tier.Condition?.Value;
		const replaced = text.replaceFormat(description, value);
		// console.group(`tier ${i++}`, { condition, description, value, replaced });
		conditions.push(`${wiki.bold(`Phase ${i}`)}: ${replaced}`);
		const rewards = tier.Reward?.StatusEffects || [];
		rewards.forEach(reward => {
			// console.log(reward);

			const rewardObject = ue.getDataTableItem(reward);
			const name = text.getStringFromTable(allTables, rewardObject.DisplayData?.Name);
			const description = text.getStringFromTable(allTables, rewardObject.DisplayData?.Description);
			const value = rewardObject.Value;

			/*
			if (rewardObject.ExtraData?.DataTable !== null) {
				// console.log('extra', rewardObject.ExtraData);
				const extraObject = ue.getDataTableItem(rewardObject.ExtraData);
				// console.log(extraObject);

				const extraName = text.getAllTables(allTables, extraObject.DisplayData?.Name);
				const extraDescription = text.getAllTables(allTables, extraObject.DisplayData?.Description);
				const extraValue = text.getAllTables(allTables, extraObject.DisplayData?.Value);
				console.log({ extraName, extraDescription, extraValue });
			}
			*/

			effects.push({
				phase: i,
				name,
				description,
				value,
			});

			// console.group('reward', { name, description, value });
			// console.groupEnd();
		});
		i++;
		// console.groupEnd();
	});
	console.log(conditions, effects);

	console.groupEnd();
});
