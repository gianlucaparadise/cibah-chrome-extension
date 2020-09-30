const radius = 1000; // 1 Km

/**
 * @typedef Subway An object describing a subway
 * @property {String} name - Subway Name
 * @property {Number} latitude - Latitude value
 * @property {Number} longitude - Longitude value
 */

/**
 * @typedef SubwayDistance An object describing the walking distance to a subway
 * @property {Subway} subway The subway
 * @property {Number} distance The distance 
 */

/**
 * Gets the list of subways within a fixed range of 2 Km
 * @param {Number} latitude Latitude for the start location
 * @param {Number} longitude Longitude for the start location
 * @returns {SubwayDistance[]} List of subways and their distances
 */
async function getSubwaysDistance(latitude, longitude) {
	try {
		const subways = await getSubways(latitude, longitude);
		return null;

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

		console.log(`subways for (${latitude},${longitude}):`);
		console.log(responseBody);

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