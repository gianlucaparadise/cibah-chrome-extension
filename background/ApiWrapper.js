const baseUrl = "http://localhost:3000/api" // DEV
// const baseUrl = "https://cibah-functions.vercel.app/api" // PROD

chrome.runtime.onMessage.addListener(function (message, sender, callback) {
	if (message.address) {
		getSubwaysDistanceFromAddress(message.address).then((response) => callback(response));
	}
	return true;
});

async function getSubwaysDistanceFromAddress(address) {
	try {
		const location = await getLocationFromAddress(address);
		if (location == null) {
			log(() => `Can't find location for: ${address}`);
			throw new Error(`Can't find location for: ${address}`)
		}

		const distanceToSubways = await getSubwaysDistance(location.latitude, location.longitude);
		return new ApiWrapperResponse(distanceToSubways, null);

	} catch (error) {
		logError(() => `Error in getSubwaysDistanceFromAddress for: ${address}`, error);

		let errorCode = "";
		if (error instanceof NetworkError && error.responseBody?.errorCode) {
			errorCode = error.responseBody?.errorCode;
		}
		else {
			errorCode = "GenericError";
		}

		return new ApiWrapperResponse(null, errorCode);
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

class ApiWrapperResponse {
	/**
	 * Create the ApiWrapper Response
	 * @param {SubwayDistance[]} data Response from backend
	 * @param {String} error Error from backend
	 */
	constructor(data, error) {
		this.data = data;
		this.error = error;
	}
}

//////  FUNCTIONS

/**
 * Tries to get the location for the input address
 * @param {String} address String containing the address
 * @returns {Promise<LatLon>} Coordinates of the input address or null when address is not found
 */
async function getLocationFromAddress(address) {
	const url = `${baseUrl}/geocode`;
	const result = await get(url, { address: address });
	return result;
}

/**
 * Gets the list of subways within a fixed range of 2 Km
 * @param {Number} latitude Latitude for the start location
 * @param {Number} longitude Longitude for the start location
 * @returns {Promise<SubwayDistance[]>} List of subways and their distances
 */
async function getSubwaysDistance(latitude, longitude) {
	const url = `${baseUrl}/subwayDistance`;
	const result = await get(url, { latitude: latitude, longitude: longitude });
	return result.subways;
}