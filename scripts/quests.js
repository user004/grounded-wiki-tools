import ue from '../utils/ue.js';
import text from '../utils/text.js';
import wiki from '../utils/wiki.js';

const quests = ue.parsePathData('/Game/Blueprints/Quests/Table_Quests_Side.0').Rows || {};

const questNames = Object.values(quests).map(quest =>
	text.getStringFromTable(quest.DisplayName))
	.filter(name => name)
	.sort()
	.map(name => wiki.link(`${name} (Quest)`, name))
	.join(' • ');

console.log(questNames);
