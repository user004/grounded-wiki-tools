import path from 'node:path';
import sharp from 'sharp';
import constants from '../utils/constants.js';

const extension = 'png';

const maps = {
	main: {
		name: 'Brookhollow Park Map',
		map: '/Game/_Augusta/UI/Images/Map/T_UI_AugustaMainMap',
		region: '/Game/_Augusta/UI/Images/Map/T_AugustaMainMapRegion',
	},
	abyss: {
		name: 'The Abyss Map',
		map: '/Game/Releases/Release_0_5_0/UI/Images/T_UI_AugustaAbyss',
		region: '/Game/Releases/Release_0_5_0/UI/Images/T_AugustaAbyssMapRegion',
	}
}

Object.values(maps).forEach(async ({ name, map, region }) => {
	const mapPath = path.format({
		root: constants.getConstant('appData'),
		name: map,
		ext: extension,
	});

	const regionPath = path.format({
		root: constants.getConstant('appData'),
		name: region,
		ext: extension,
	});

	const toPath = path.format({
		root: constants.getConstant('appOutput'),
		name: name,
		ext: extension,
	});

	const compositeMap = await sharp(mapPath)
		.composite([{ input: regionPath, top: 0, left: 0 }])
		.toBuffer();

	await sharp(compositeMap)
		.rotate(90)
		.trim()
		.toFile(toPath);

});
