const CONSTANTS = {
	tableIdToString: {
		1: 'game/gui',
		2: 'game/items',
		9: 'game/characters',
		22: 'game/buildings',
		193: 'game/burglequests',
		// TODO: add more
		/* remaining in alphabetical order
			game/areas
			game/chatwheel
			game/cutscene
			game/dataitems
			game/deathmessages
			game/gizmos
			game/harvestnodes
			game/inputbindings
			game/news
			game/perks
			game/pointsofinterest
			game/props
			game/quests
			game/statuseffects
			game/techtree
			game/tutorial
		*/
	}
};

const getConstant = (constant) => CONSTANTS[constant] || {};

export default { getConstant };
