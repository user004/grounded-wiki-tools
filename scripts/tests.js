import fs from 'node:fs';
import path from 'node:path';
import text from '../utils/text.js';
// import ue from '../utils/ue.js';

const allTables = text.getAllTables();
console.log(allTables);


process.exit(0);

// const test = ue.parsePathData('/Game/Releases/Release_0_5_0/Design/PointsOfInterest/Augusta/POI_Augusta_TheAbyss.0')?.Properties?.DisplayName;
// console.log(text.getStringFromTable(allTables, test));


const filePaths = fs.globSync('data/Game/Releases/*/Design/PointsOfInterest/Augusta/*.json');
console.log(filePaths);

filePaths.forEach(filePath => {
	const content = fs.readFileSync(filePath, 'utf8');
	const json = JSON.parse(content);
	// console.log(json);
});
