dewStorage = (function () {
	var module = {};

	module.available = function () {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	},

	module.get = function (name) {
		var item = localStorage.getItem(name);

		if (item !== undefined)
			return item;
		else
			return false;
	},

	module.set = function (name, val) {
		localStorage.setItem(name, val);            
	},

	module.setArray = function (name, val) {
		var tmp = JSON.parse(dewStorage.get(name));
		if (tmp == null) {
			tmp = [];
		}

		tmp.push(val);

		dewStorage.set(name, JSON.stringify(tmp));
	},


	module.clear = function () {
		localStorage.clear();
	},

	module.loadSettings = function () {
		var isCondensed = dewStorage.get("condensed");

		if (isCondensed == "true") {
			toggleCondensed(false);
		}

		var pings = dewStorage.get("orderByPing");

		if (pings == "true") {
			orderPing(false);
		}

		checkFavouriteList();

	}
	module.active = module.available();
	return module;
})();