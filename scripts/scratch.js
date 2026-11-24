import ue from '../utils/ue.js';
import text from '../utils/text.js';

const termiteDelight = ue.parsePathData('/Game/Blueprints/Items/Table_AllItems').Rows.MealTier4TermiteDelight || {};

let effects = [];
termiteDelight.ConsumableData.forEach(consume => {
	const consumeObject = ue.getDataTableItem(consume);
	consumeObject.StatusEffects.forEach(effect => {
		const effectObject = ue.getDataTableItem(effect);
		const effectName = text.getStringFromTable(effectObject.DisplayData.Name);
		console.log(effectName);

	});
});

const output = {
	tier: termiteDelight.Tier,
};

console.log(output);
