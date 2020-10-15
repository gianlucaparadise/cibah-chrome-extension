const baseUrl = "http://localhost:3000/api" // DEV
// const baseUrl = "https://cibah-functions.vercel.app/api" // PROD

chrome.runtime.onMessage.addListener(function (message, sender, callback) {
	if (message.address) {
		getSubwaysDistanceFromAddress(message.address).then(callback);
	}
	return true;
});

async function getSubwaysDistanceFromAddress(address) {
	try {
		const location = await getLocationFromAddress(address);
		if (location == null) {
			log(() => `Can't find location for: ${address}`);
			return;
		}

		// log(() => `Title: ${message.address}, Location: ${location.latitude},${location.longitude}`);

		const distanceToSubways = await getSubwaysDistance(location.latitude, location.longitude);
		return distanceToSubways;
	} catch (error) {
		log(() => `Error in getSubwaysDistanceFromAddress for: ${address}`);
		log(() => error);

		return null;
	}
}

//////  MODELS

/**
 * @typedef LatLon An object representing coordinates
 * @property {Number} latitude - Latitude value
 * @property {Number} longitude - Longitude value
 */

/**
 * @typedef Subway An object describing a subway
 * @property {String} name Subway Name
 * @property {Number} latitude Latitude value
 * @property {Number} longitude Longitude value
 */

/**
 * @typedef SubwayDistance An object describing the walking distance to a subway
 * @property {Subway} subway The subway
 * @property {LatLon} start The coordinates of the starting point
 * @property {Number} distanceMeters The distance in meters
 * @property {Number} distanceMinutes The distance in minutes (walking)
 */

//////  FUNCTIONS

/**
 * Tries to get the location for the input address
 * @param {String} address String containing the address
 * @returns {Promise<LatLon>} Coordinates of the input address or null when address is not found
 */
async function getLocationFromAddress(address) {
	try {
		const url = `${baseUrl}/geocode`;
		return await get(url, { address: address });

	} catch (error) {
		log(() => `Error in getLocationFromAddress for: ${address}`);
		log(() => error);

		return null;
	}
}

/**
 * Gets the list of subways within a fixed range of 2 Km
 * @param {Number} latitude Latitude for the start location
 * @param {Number} longitude Longitude for the start location
 * @returns {Promise<SubwayDistance[]>} List of subways and their distances
 */
async function getSubwaysDistance(latitude, longitude) {
	try {
		const url = `${baseUrl}/subwayDistance`;
		return await get(url, { latitude: latitude, longitude: longitude });

	} catch (error) {
		log(() => `Error in getSubwaysDistance for: (${latitude},${longitude})`);
		log(() => error);

		return null;
	}
}