import utils from './utils.js';

// start performance counter
performance.now();

/**
 * Wraps text in the wiki's bold markup.
 * @param {string} text - Text to format.
 * @returns {string} Bold-formatted wiki text.
 */
const bold = (text) => `'''${text}'''`;

const code = (code) =>
	['<pre>', code, '</pre>']
		.join(comment.match(/\n/gi) ? `\n` : '');

const comment = (comment) =>
	['<!--', comment, '-->']
		.join(comment.match(/\n/gi) ? `\n` : ' ');

/**
 * Applies known naming corrections to text before it is used in wiki markup.
 * @param {string} string - Text to correct.
 * @returns {string} Corrected text.
 */
const fix = (string) => {
	let replaced = string;

	const fixMap = [
		{
			find: /\bWall Mount\b/g,
			replace: 'Mount',
		},
	];

	fixMap.forEach(({ find, replace }) => {
		if (find.test(replaced)) {
			replaced = replaced.replaceAll(find, replace);
		}
	});

	return replaced;
};

/**
 * Creates an icon template with an optional size and label position.
 * @param {string} icon - Icon name or label.
 * @param {number} [size] - Optional icon size in pixels.
 * @param {string} [labelSide='right'] - Label position, or an empty string to omit it.
 * @returns {string} Formatted wiki icon template.
 */
const icon = (icon, size, labelSide = 'right') => {
	let params = [icon];
	if (size) params.push(`${size}px`);
	if (labelSide) params.push(`4=${labelSide}`);

	return `{{Icon|${params.join('|')}}}`
};

/**
 * Wraps text in the wiki's italic markup.
 * @param {string} text - Text to format.
 * @returns {string} Italic-formatted wiki text.
 */
const italic = (text) => `''${text}''`;

/**
 * Creates a wiki link, optionally with display text.
 * @param {string} link - The page or target to link to.
 * @param {string} [text=''] - Optional display text for the link.
 * @returns {string} Formatted wiki link.
 */
const link = (link, text = '') => `[[${fix(link)}${text && `|${text}`}]]`;

/**
 * Formats each item as a wiki list entry.
 * @param {string[]} items - Items to include in the list.
 * @returns {string} Wiki list entries separated by newlines.
 */
const list = (items) => '\n' + items.map(item => `* ${item}`).join('\n');

/**
 * Converts a raw science value into the wiki icon template.
 * @param {number|string} value - The raw science value.
 * @returns {string} Wiki template for the value, for example `{{Icon/Raw Science|1|5|0|0}}`.
 */
const rawScience = (value) => `{{${['Icon/Raw Science', ...`${value}`.split('')].join('|')}}}`;

/**
 * Wraps formatted rows in a wiki table, with optional sortable and collapsible classes.
 * @param {string[]} rows - Formatted table rows.
 * @param {boolean} [sortable=false] - Whether to make the table sortable.
 * @param {boolean} [collapsible=false] - Whether to make the table collapsible.
 * @param {boolean} [collapsed=false] - Whether the collapsible table starts collapsed.
 * @returns {string} Formatted wiki table.
 */
const table = (rows, options = {
	sortable: false,
	collapsible: false,
	collapsed: false,
	styles: {},
	attributes: {}
}) => {
	let classes = ['wikitable'];

	if (options.sortable) classes.push('sortable');
	if (options.collapsible) classes.push('mw-collapsible');
	if (options.collapsed) classes.push('mw-collapsed');

	const defaultStyles = {
		fontSize: '15px',
		minWidth: '50%',
		width: '100%',
	};
	const mergedStyles = utils.deepMerge(defaultStyles, options.styles);

	const defaultAttributes = {
		class: classes.join(' '),
		style: utils.stringifyObject(mergedStyles, 'style'),
	};
	const mergedAttributes = utils.deepMerge(defaultAttributes, options.attributes);

	return `{| ${utils.stringifyObject(mergedAttributes)}\n\n${rows.join('\n\n')}\n\n|}`;
};

/**
 * Formats header cells as a wiki table header row and applies the header style.
 * @param {{attrs: Record<string, string>, content: string}[]} headers - Header cells and their attributes.
 * @returns {string} Formatted wiki table header row.
 */
const tableHeader = (headers = []) =>
	tableRow(headers.map(header => {
		const defaultStyles = {
			backgroundColor: 'var(--wiki-accent-color)',
			color: '#fff',
		};
		const mergedStyles = utils.deepMerge(defaultStyles, header.styles || {});

		// none currently, future-proofing
		const defaultAttributes = {};
		const mergedAttributes = utils.deepMerge(defaultAttributes, header.attributes || {});

		return {
			styles: mergedStyles,
			attributes: mergedAttributes,
			content: header.content || header || '',
		};
	}), true);

/**
 * Formats columns as a wiki table row.
 * @param {(string|number|{attrs: Record<string, string>, content: string})[]} columns - Cell contents or cells with attributes.
 * @param {boolean} [isHeader=false] - Whether to format the row as a header.
 * @returns {string} Formatted wiki table row.
 */
const tableRow = (columns = [], isHeader = false) => {
	const separator = isHeader ? '!' : '|';

	const formattedColumns = columns.map(column => {
		// string, straight to output
		if (typeof column !== 'object') return column;

		// expected options
		const {
			styles = {},
			attributes = {},
			content = '',
		} = column;

		if (styles) attributes.style = utils.stringifyObject(styles, 'style');

		return `${utils.stringifyObject(attributes)} | ${content}`;
	});

	return `|-\n${separator} ${formattedColumns.join(`\n${separator} `)}`;
};

const timestamp = () => {
	const end = performance.now();

	let duration = `${end.toFixed(0)}ms`;

	if (end >= 60000) {
		// would be wild to take this long...
		duration = `${(end / 10000).toFixed(2)}m`;
	} else if (end >= 1000) {
		duration = `${(end / 1000).toFixed(1)}s`
	}

	console.log(comment(`Generated on ${new Date().toISOString()} in ${duration}`));
}

const title = (text, tier = 1) =>
	`\n${'='.repeat(tier)} ${text} ${'='.repeat(tier)}\n`;

export default { bold, code, comment, icon, italic, link, list, rawScience, table, tableHeader, tableRow, timestamp, title };
