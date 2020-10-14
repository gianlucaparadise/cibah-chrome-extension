log(() => "🏠 Cibah 🚉 running");

async function run() {
	const listOfAds = $(".annunci-list .listing-item.js-row-detail");

	for (let index = 0; index < listOfAds.length; index++) {
		const element = listOfAds[index];

		const title = $(element).find(".titolo").text().trim();

		const location = await getLocationFromAddress(title);
		if (location == null) {
			log(() => `Can't find location for: ${title}`);
			return;
		}

		log(() => `Title: ${title}, Location: ${location.latitude},${location.longitude}`);

		const distanceToSubways = await getSubwaysDistance(location.latitude, location.longitude);

		log(() => `Distance to Subways: ${title}`);
		log(() => distanceToSubways);

		if (distanceToSubways != null && distanceToSubways.length > 0) {
			// Creating the HTML item
			const newItem = $('<li class="lif__item cibah-item">🚉</li>');
			newItem.data("cibah", distanceToSubways);

			const listingFeatures = $(element).find(".listing-features");
			$(listingFeatures).append(newItem);
		}
	}

	log(() => `Setting up the tooltip`);
	// Setting up the tooltip
	$(document).tooltip({
		items: ".cibah-item",
		content: function () {
			let element = $(this);
			if (!element.is(".cibah-item")) return;

			/**
			 * @type {SubwayDistance[]}
			 */
			let distanceToSubways = element.data("cibah");

			log(() => `Tooltip: Distance to Subways`);
			log(() => distanceToSubways);

			if (distanceToSubways == null || distanceToSubways.length <= 0) {
				return "No Subways within 1km";
			}

			const closestSubway = distanceToSubways[0];
			const name = closestSubway.subway.name;
			const minutes = closestSubway.distanceMinutes.toFixed(0);
			const meters = closestSubway.distanceMeters.toFixed(0);
			return `${name} ${minutes} min (${meters}m)`;

			// return "<img class='map' alt='" + text +
			// 	"' src='http://maps.google.com/maps/api/staticmap?" +
			// 	"zoom=11&size=350x350&maptype=terrain&sensor=false&center=" +
			// 	text + "'>";
		}
	});
}

run();