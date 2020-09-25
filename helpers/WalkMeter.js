const radius = 1000; // 1 Km

/**
 * Gets the list of subways within a fixed range of 2 Km
 * @param {Number} latitude Latitude for the start location
 * @param {Number} longitude Longitude for the start location
 */
async function getSubwaysDistance(latitude, longitude) {
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

	} catch (error) {
		log(() => `Error while Searching for subways for location: (${latitude},${longitude})`);
		log(() => error);

		return null;
	}
}