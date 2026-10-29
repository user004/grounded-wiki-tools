// {{Recipe:Item/G2|Item=Stuffed Centipede|Material1Quanity=2|Material1=Centipede Antenna|Material2Quanity=5|Material2=Centipede Segment|Material3Quanity=8|Material3=Centipede Leg|Material4Quanity=6|Material4=Cattail Fluff|Station=Crafted in World}}
// {{Recipe:Item/G2|Item=Arrow|Amount=(x10)|Material1Quantity=2|Material1=Mite Fuzz|Material2Quantity=5|Material2=Thistle Needle|Station=Crafted by Hand}}
const item = (item = '', materials = [], station = '', amount = 1) => {
	let templateParts = [];

	if (item) templateParts.push(`Item=${item}`);

	for (let [key, value] of Object.entries(materials)) {
		templateParts.push(...[
			`Material${+key + 1}Quantity=${value.quantity}`,
			`Material${+key + 1}=${value.name}`,
		]);
	}

	if (station) templateParts.push(`Station=${station}`);

	if (amount > 1) templateParts.push(`Amount=(x${amount})`);

	return `{{Recipe:Item/G2|${templateParts.join('|')}}}`
}

const smoothie = (smoothie = '', ingredients = []) => {
	let templateParts = [];

	if (smoothie) templateParts.push(`Smoothie=${smoothie}`);

	for (let [key, value] of Object.entries(ingredients)) {
		templateParts.push(`Ingredient${+key + 1}=${value.name}`);
	}

	return `{{Recipe:Smoothie/G2|${templateParts.join('|')}}}`;
};

export default { item, smoothie };
