import text from '../utils/text.js';
import ue from '../utils/ue.js';
import wiki from '../utils/wiki.js';

// TODO: rate limiting
/*
const getImage = (path, size = 50) => {
	setTimeout(async () => {
		let imagePath = `File:${path}G2.png`;
		const g2Exists = await checkUrl(imagePath);
		if (!checkUrl(imagePath)) imagePath = `File:${path}.png`;
		return `[[File:${imagePath}|${size}}px]]`;
	}, 1000);
}
*/

const isGoldOnly = (title) =>
	[
		'Garter Snake',
		'Sunny',
		'Calico',
		'Oriole',
		'Dagon',
		'Crow',
	].includes(title);

const fixBoth = (string) => {
	switch (string) {
		case 'The Masked Stranger':
		case 'The Masked Fighter':
			return string.replace(/^The /i, '');

		default:
			return string;
	}
};

const fixG2Images = (string) => {
	switch (string) {
		case 'Ladybug':
		case 'Bee':
		case 'Black Worker Ant':
		case 'Firefly':
		case 'Water Flea':
		case 'Mosquito':
		case 'Stinkbug':
		case 'Orb Weaver':
		case 'Bombardier Beetle':
		case 'Diving Bell Spider':
		case 'Wolf Spider':
		case 'Black Soldier Ant':
		case 'Wasp':
		case 'Wasp Drone':
		case 'Tiger Mosquito':
		case 'Tick':
		case 'Spiny Water Flea':
		case 'Green Shield Bug':
		case 'Termite Soldier':
		case 'Termite King':
		case 'Termite Worker':
			return `${string}G2`;

		default:
			return string;
	}
};

const fixImage = (image) => {
	switch (image) {
		case 'Ancient Pond Jockey Swarm':
			return 'Pond Jockey Swarm';

		case 'The Masked Fighter':
			return 'The Masked Stranger'

		// fish
		case 'Sunny':
		case 'Calico':
		case 'Oriole':
		case 'Dagon':
			return 'Koi Fish'

		default:
			return image.replace(/\.$/i, '');
	}
};

const fixTier = (tier) => {
	switch (tier) {
		case 0:
			return 1;

		default:
			return tier;
	}
}

const allTables = text.getAllTables();

const keyItems = ue.parsePathData('/Game/Blueprints/Items/ItemTables/Table_Items_KeyItems.0').Rows || [];

const creatureCards = Object.values(keyItems).filter(keyItem => keyItem.KeyItemCategory?.TagName === 'KeyItem.Entities');

let categorizedCards = {};

const categoryMap = {
	'Neutral': 'Grumpy',
	'O.R.C.': 'ORC',
	'Angry': 'Angry',
	'Harmless': 'Friendly',
	'O.G.R.R.': 'OGRE',
};

for (let [key, category] of Object.entries(categoryMap)) {
	const cards = creatureCards.filter(card => card.KeyItemSubCategory?.TagName === `KeyItem.Entities.${category}`);
	categorizedCards[key] = cards.map(card => {
		return {
			tier: card.Tier,
			title: text.getStringFromTable(allTables, card.LocalizedDisplayName),
		};
	}).sort((a, b) => {
		if (a.tier < b.tier) return -1;
		if (a.tier > b.tier) return 1;
		return 0;
	});
};

const tables = Object.keys(categorizedCards).map(category => {
	const colspan = 4;
	const tableHeader = wiki.tableHeader([
		{
			attrs: {
				colspan,
				style: 'width: 20%;',
			},
			content: `${category} Creature Cards`,
		}
	]);

	const creatures = categorizedCards[category];
	const rowData = Array.from({ length: Math.ceil(creatures.length / colspan) }, (_, i) =>
		creatures.slice(i * colspan, i * colspan + colspan)
	);

	const rows = rowData.map((row) => wiki.tableRow(row.map(({ tier, title }) =>
		`${!isGoldOnly(title) ? `[[File:creaturecard ${fixG2Images(fixBoth(fixImage(title)))}.png|50px]] ` : ''}[[File:creaturecardgold ${fixBoth(fixImage(title))}.png|50px]]<br>[[${fixBoth(title)}]]<br>[[File:CreatureTier${fixTier(tier)}.png|30px]]`)));

	return wiki.table([tableHeader, ...rows], false, true, false);
});

console.log(tables.join('\n\n'));

wiki.timestamp();
