const endpoint = new URL('https://grounded.wiki.gg/api.php');
const checkUrl = async (path) => {
	const params = new URLSearchParams({
		action: 'query',
		titles: path,
		format: 'json',
	});

	try {
		const response = await fetch(`${endpoint}?${params}`);
		if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

		const data = await response.json();
		if (data.query?.pages) {
			for (let [key, value] of Object.entries(data.query?.pages)) {

				if (key !== '-1' && !Object.hasOwn(value, 'missing')) return true;
			}
		}
	} catch (error) {
		console.error('Failed to fetch:', error);
	}

	return false;
};

const check1 = await checkUrl('Termite King');
const check2 = await checkUrl('File:Creaturecard Termite King.png');
const check3 = await checkUrl('File:Creaturecard Termite KingG2.png');
// console.log({ check1, check2, check3 });

export default checkUrl;
