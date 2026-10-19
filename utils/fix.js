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

export default fix;
