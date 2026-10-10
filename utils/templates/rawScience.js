/**
 * converts raw science value into wiki template
 * @param {int} value - the value of raw sicence
 * @returns {string} wiki template for value, ex: {{Icon/Raw Science|1|5|0|0}}
 */
const rawScience = (value) =>
	`{{${['Icon/Raw Science', ...`${value}`.split('')].join('|')}}}`;

export default rawScience;
