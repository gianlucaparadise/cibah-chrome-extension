log(() => "🏠 Cibah 🚉 running");

// log(() => `Setting up the tooltip`);
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

/**
 * Creates the HTML element with the list of subways
 * @param {any} root Root HTML List Item
 * @param {SubwayDistance[]} distanceToSubways List of subways and their distances
 */
function addSubwayItem(root, distanceToSubways) {
	// if (distanceToSubways != null && distanceToSubways.length > 0) {
	// Creating the HTML item
	const newItem = $('<li class="lif__item cibah-item">🚉</li>');
	newItem.data("cibah", distanceToSubways);

	const listingFeatures = $(root).find(".listing-features");
	$(listingFeatures).append(newItem);
	// }
}

async function run() {
	const listOfAds = $(".annunci-list .listing-item.js-row-detail");

	for (let index = 0; index < listOfAds.length; index++) {
		const element = listOfAds[index];

		const title = $(element).find(".titolo").text().trim();

		chrome.runtime.sendMessage({ address: title }, (response) => addSubwayItem(element, response));
	}
}

run();