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
		if (error.responseBody?.error?.code) {
			errorCode = error.responseBody.error.code;
		}
		else {
			errorCode = "GenericError";
		}

		return new ApiWrapperResponse(null, errorCode);
	}
}

//////  MODELS

/** An object representing coordinates */
class LatLon {
	/**
	 * Creates a LatLon object
	 * @param {Number} latitude Latitude value
	 * @param {Number} longitude Longitude value
	 */
	constructor(latitude, longitude) {
		this.latitude = latitude;
		this.longitude = longitude;
	}
}

/** An object describing a subway */
class Subway {
	/**
	 * Creates a Subway object
	 * @param {String} name Subway Name
	 * @param {Number} latitude Latitude value
	 * @param {Number} longitude Longitude value
	 */
	constructor(name, latitude, longitude) {
		this.name = name;
		this.latitude = latitude;
		this.longitude = longitude;
	}
}

/** An object describing the walking distance to a subway */
class SubwayDistance {
	/**
	 * Creates a SubwayDistance object
	 * @param {Subway} subway The subway
	 * @param {LatLon} start The coordinates of the starting point
	 * @param {Number} distanceMeters The distance in meters
	 * @param {Number} distanceMinutes The distance in minutes (walking)
	 */
	constructor(subway, start, distanceMeters, distanceMinutes) {
		this.subway = subway;
		this.start = start;
		this.distanceMeters = distanceMeters;
		this.distanceMinutes = distanceMinutes;
	}
}

/** 
 * This class is the interface between the background code and
 * the frontend code. This holds both the error and the response.
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

/** Response Error object */
class ErrorBody {
	/**
	 * @param {String} code Error code
	 * @param {String} message Error message
	 */
	constructor(code, message) {
		this.code = code;
		this.message = message;
	}
}

/** Response body for the Geocode API */
class GeocodeResponse {
	/**
	 * @param {LatLon} data Coordinates
	 * @param {ErrorBody} error Error body
	 */
	constructor(data, error) {
		this.data = data;
		this.error = error;
	}
}

/** Response body for the SubwaysDistance API */
class SubwaysDistanceResponse {
	/**
	 * @param {SubwayDistance[]} data Subways
	 * @param {ErrorBody} error Error body
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

	/** @type {GeocodeResponse} */
	const result = await get(url, { address: address });

	return result.data;
}

/**
 * Gets the list of subways within a fixed range of 2 Km
 * @param {Number} latitude Latitude for the start location
 * @param {Number} longitude Longitude for the start location
 * @returns {Promise<SubwayDistance[]>} List of subways and their distances
 */
async function getSubwaysDistance(latitude, longitude) {
	const url = `${baseUrl}/subwayDistance`;

	/** @type {SubwaysDistanceResponse} */
	const result = await get(url, { latitude: latitude, longitude: longitude });

	return result.data;
}