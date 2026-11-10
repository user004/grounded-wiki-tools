import util from 'node:util';
import constants from '../utils/constants.js';
import text from '../utils/text.js';

const tableKeys = constants.getConstant('tableIdToString');

// get args
const { values, positionals } = util.parseArgs({
	options: {
		includeConversations: {
			type: 'boolean',
			short: 'i',
			default: false,
		}
	},
	allowPositionals: true,
});

let allMatches = {};
positionals.forEach(search => {
	const allStringTables = text.getAllStringTables();

	allStringTables.forEach(table => {
		if (!values.includeConversations && !table.Key.startsWith('game/')) return;
		// TODO: make matches inclusive?
		const matches = table.Value.Entries.filter(({ Value: { DefaultText = '' } }) =>
			DefaultText.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
		if (matches.length > 0) {
			if (Array.isArray(allMatches[table.Key])) {
				allMatches[table.Key].push(...matches);
			} else {
				allMatches[table.Key] = matches;
			}
		}
	});
});

const colors = [
	'Yellow',
	'Blue',
	'Green',
	'Cyan',
	'Magenta',
	'Red',
];

function chunkText(text, maxLength) {
	const words = text.split(' ');
	const chunks = [];
	let currentChunk = '';

	for (const word of words) {
		// If adding the next word exceeds the limit
		if ((currentChunk + word).length > maxLength) {
			if (currentChunk) {
				chunks.push(currentChunk.trim());
				currentChunk = '';
			}

			// Edge case: If a single word is longer than maxLength, force-split it
			if (word.length > maxLength) {
				chunks.push(word.substring(0, maxLength));
				// Keep checking the rest of that giant word in the next iterations if needed
				continue;
			}
		}
		currentChunk += word + ' ';
	}

	if (currentChunk.trim()) {
		chunks.push(currentChunk.trim());
	}

	return chunks;
}

// process.exit(0);

Object.keys(allMatches).forEach(tableKey => {
	const keyKey = Object.keys(tableKeys).find(key => tableKeys[key] === tableKey);
	console.group(`${tableKey} (${keyKey ? keyKey : '???'})`);
	allMatches[tableKey].forEach(({ Key, Value: { DefaultText } }) => {

		console.group(Key);
		let result = DefaultText;
		let colorI = 0;

		positionals.forEach(search => {
			result = result.replaceAll(new RegExp(search, 'gi'), util.styleText(['bold', `bg${colors[colorI]}`], '$&'));
			colorI++;
		});

		// console.log(chunkText(result, 40).join(`\n`));
		console.log(result);

		console.groupEnd();
	});
	console.groupEnd();
});
