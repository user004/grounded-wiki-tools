import util from 'node:util';
import constants from '../utils/constants.js';
import text from '../utils/text.js';
import wiki from '../utils/wiki.js';

const tableKeys = constants.getConstant('tableIdToString');

// get args
const { values, positionals } = util.parseArgs({
	options: {
		inclusiveSearch: {
			type: 'boolean',
			short: 'i',
			default: false,
		},
		includeConversations: {
			type: 'boolean',
			short: 'c',
			default: false,
		}
	},
	allowPositionals: true,
});

const allMatches = {};
if (positionals.length > 0) {
	const searches = positionals.map(search => search.toLocaleLowerCase());
	const allStringTables = text.getAllStringTables();

	allStringTables.forEach(table => {
		if (!values.includeConversations && !table.Key.startsWith('game/')) return;

		const matches = table.Value.Entries.filter(({ Value: { DefaultText = '' } }) => {
			const text = DefaultText.toLocaleLowerCase();
			return values.inclusiveSearch
				? searches.every(search => text.includes(search))
				: searches.some(search => text.includes(search));
		});
		if (matches.length > 0) allMatches[table.Key] = matches;
	});
}

const colors = [
	'bgYellow',
	'bgBlue',
	'bgGreen',
	'bgRed',
	'bgMagenta',
	'bgCyan',
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
			result = result.replaceAll(new RegExp(search, 'gi'), util.styleText(['bold', colors[colorI]], '$&'));

			colorI++;
			if (colorI === colors.length) colorI = 0;
		});

		// console.log(chunkText(result, 40).join(`\n`));
		console.log(result);

		console.groupEnd();
	});
	console.groupEnd();
});

console.log(`\nTotal: ${Object.keys(allMatches).map(key => allMatches[key].length).reduce((acc, cur) => acc + cur, 0)}\n`);

wiki.timestamp();
