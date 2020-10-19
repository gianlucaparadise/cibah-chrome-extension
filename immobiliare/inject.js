log(() => "🏠 Cibah 🚉 running");

const cibahSubwaysTooltipClass = "cibah-item";
const cibahZeroSubwaysClass = "cibah-item-no-subways";

// Setting up the tooltip
$(document).tooltip({
	items: `.${cibahSubwaysTooltipClass}`,
	content: function () {
		let element = $(this);
		if (!element.is(`.${cibahSubwaysTooltipClass}`)) return;

		/**
		 * @type {SubwayDistance[]}
		 */
		let distanceToSubways = element.data("cibah");

		if (distanceToSubways == null || distanceToSubways.length <= 0) {
			return "No Subways within 1km";
		}

		return distanceToSubways.map(s => {
			const name = s.subway.name;
			const minutes = s.distanceMinutes.toFixed(0);
			const meters = s.distanceMeters.toFixed(0);
			return `${name} ${minutes} min (${meters}m)`;
		}).join("<br/>");
	}
});

/**
 * Creates the HTML element with the list of subways
 * @param {any} root Root HTML List Item
 * @param {SubwayDistance[]} distanceToSubways List of subways and their distances
 * @param {String} error Network Error instance
 */
function addSubwayItem(root, distanceToSubways, error) {
	// Creating the HTML item
	const hasSubways = distanceToSubways && distanceToSubways.length > 0;
	const itemClass = hasSubways ? cibahSubwaysTooltipClass : cibahZeroSubwaysClass;

	let closest = "";
	if (error) closest = "Error";
	else if (!hasSubways) closest = "No subways";
	else closest = `${distanceToSubways[0].distanceMinutes.toFixed(0)} min`;

	const newItem = $(`<li class="lif__item ${itemClass}">🚉 ${closest}</li>`);
	newItem.data("cibah", distanceToSubways);

	const listingFeatures = $(root).find(".listing-features");
	$(listingFeatures).append(newItem);
}

/**
 * Process Response from backend
 * @param {String} title Title that ran the request
 * @param {HTMLElement} element Html Element where to add the result
 * @param {ApiWrapperResponse} response Response from backend
 */
function onResponse(title, element, response) {
	log(() => `Received subways for: ${title}`);
	log(() => response);

	if (response.error) addSubwayItem(element, null, response.error);
	else addSubwayItem(element, response.data, null);
}

async function run() {
	const listOfAds = $(".annunci-list .listing-item.js-row-detail");

	for (let index = 0; index < listOfAds.length; index++) {
		const element = listOfAds[index];

		const title = $(element).find(".titolo").text().trim();

		chrome.runtime.sendMessage({ address: title }, (response) => onResponse(title, element, response));
	}
}

run();