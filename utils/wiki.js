/**
 * Wraps text in the wiki's bold markup.
 * @param {string} text - Text to format.
 * @returns {string} Bold-formatted wiki text.
 */
const bold = (text) => `'''${text}'''`;

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
const table = (rows, sortable = false, collapsible = false, collapsed = false) => {
	let classes = ['wikitable'];
	if (sortable) classes.push('sortable');
	if (collapsible) classes.push('mw-collapsible');
	if (collapsed) classes.push('mw-collapsed');

	return `{| class="${classes.join(' ')}" width="100%" style="text-align: center; font-size: 15px;"\n${rows.join('\n')}\n|}`;
};

/**
 * Formats header cells as a wiki table header row and applies the header style.
 * @param {{attrs: Record<string, string>, content: string}[]} headers - Header cells and their attributes.
 * @returns {string} Formatted wiki table header row.
 */
const tableHeader = (headers) =>
	tableRow(headers.map(header => {
		header.attrs.style = 'background-color: var(--wiki-accent-color); color: #ffffff;';
		return header;
	}), true);

/**
 * Formats columns as a wiki table row.
 * @param {(string|number|{attrs: Record<string, string>, content: string})[]} columns - Cell contents or cells with attributes.
 * @param {boolean} [header=false] - Whether to format the row as a header.
 * @returns {string} Formatted wiki table row.
 */
const tableRow = (columns, header = false) => {
	const separator = header ? '!' : '|';

	const formattedColumns = columns.map(column => {
		if (typeof column !== 'object') return column;

		const { attrs, content } = column;

		let formattedAttrs = [];
		for (const [key, value] of Object.entries(attrs)) {
			formattedAttrs.push(`${key}="${value}"`);
		}

		return `${formattedAttrs.join(' ')} | ${content}`;
	});

	return `|-\n${separator} ${formattedColumns.join(`\n${separator} `)}`;
};

export default { bold, icon, italic, link, list, rawScience, table, tableHeader, tableRow };
