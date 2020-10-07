const radius = 1000; // 1 Km

/**
 * @typedef LatLon An object representing coordinates
 * @property {Number} latitude Latitude value
 * @property {Number} longitude Longitude value
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

/**
 * Gets the list of subways within a fixed range of 2 Km
 * @param {Number} latitude Latitude for the start location
 * @param {Number} longitude Longitude for the start location
 * @returns {Promise<SubwayDistance[]>} List of subways and their distances
 */
async function getSubwaysDistance(latitude, longitude) {
	try {
		const subways = await getSubways(latitude, longitude);
		const subwayDistances = await getDistanceToSubways(latitude, longitude, subways);

		return subwayDistances;

	} catch (error) {
		log(() => `Error in getSubwaysDistance for: (${latitude},${longitude})`);
		log(() => error);

		return null;
	}
}

/**
 * Gets the list of subways within a fixed range of 2 Km
 * @param {Number} latitude Latitude for the start location
 * @param {Number} longitude Longitude for the start location
 * @returns {Promise<Subway[]>} List of nearby subways
 */
async function getSubways(latitude, longitude) {
	try {
		if (latitude == null || longitude == null) {
			throw new Error("Input Data is invalid");
		}

		const request = `
			<osm-script output="json" timeout="10">
				<query type="node">
					<has-kv k="railway" v="station"/>
					<has-kv k="station" v="subway"/>
					<around lat="${latitude}" lon="${longitude}" radius="${radius}"/>
				</query>
				<print/>
			</osm-script>
		`;
		const encodedRequest = encodeURIComponent(request);
		const url = `https://overpass-api.de/api/interpreter?data=${encodedRequest}`;

		log(() => `Retrieving subways for (${latitude},${longitude})`);
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Network response was not ok: ${response.status} - ${response.statusText}`);
		}

		const responseBody = await response.json();

		/**
		 * @type {Subway[]}
		 */
		const subways = responseBody.elements.map((el) => {
			/**
		 	 * @type {Subway}
		 	 */
			const result = { latitude: el.lat, longitude: el.lon, name: el.tags.name };
			return result;
		});

		return subways;

	} catch (error) {
		log(() => `Error while Searching for subways for location: (${latitude},${longitude})`);
		log(() => error);

		return null;
	}
}

/**
 * Gets the distance for 
 * @param {Subway[]} subways Destination points
 * @returns {Promise<SubwayDistance[]>}
 */
async function getDistanceToSubways(startLatitude, startLongitude, subways) {
	try {
		if (startLatitude == null || startLongitude == null) {
			throw new Error("Input location is invalid");
		}

		if (subways == null) {
			throw new Error("Input destination list is invalid");
		}

		if (subways.length == 0) {
			return null
		}

		const sourceLocation = `[${startLongitude},${startLatitude}]`;
		const sourceDestinations = subways.map((s) => `[${s.longitude},${s.latitude}]`).join(",");
		const destinationsIndex = range(subways.length, 1).join(",");
		const request = `
		{
			"locations": [${sourceLocation},${sourceDestinations}],
			"destinations": [${destinationsIndex}],
			"metrics": [
				"distance",
				"duration"
			],
			"sources": [0],
			"units": "m"
		}`;
		const url = `https://api.openrouteservice.org/v2/matrix/foot-walking`;

		log(() => `Retrieving distance to subways for (${startLatitude},${startLongitude})`);
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
				"Authorization": ""
			},
			body: request
		});

		if (!response.ok) {
			throw new Error(`Network response was not ok: ${response.status} - ${response.statusText}`);
		}

		const responseBody = await response.json();

		/**
		 * @type {SubwayDistance[]}
		 */
		const result = subways.map((subway, index) => {
			/**
		 	 * @type {SubwayDistance}
			 */
			const distanceToSubway = {
				subway: subway,
				start: { latitude: startLatitude, longitude: startLongitude },
				distanceMeters: responseBody.distances[0][index],
				distanceMinutes: responseBody.durations[0][index] / 60.0,
			}

			return distanceToSubway;
		}).sort((a, b) => a.distanceMinutes - b.distanceMinutes);

		return result;

	} catch (error) {
		log(() => `Error while retrieving distance to subways for location: (${startLatitude},${startLongitude})`);
		log(() => error);

		return null;
	}
}

/**
 * Generates an array of number from "startAt" to "size"
 * @param {Number} size Max number
 * @param {Number} startAt Min number
 * @returns {Number[]} List of numbers
 */
function range(size, startAt = 0) {
	return [...Array(size - startAt).keys()].map(i => i + startAt);
}