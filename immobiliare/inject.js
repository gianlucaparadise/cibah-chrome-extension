log(() => "🏠 Cibah 🚉 running");

const listOfAds = $(".annunci-list .listing-item.js-row-detail");

$(listOfAds).each(async (index, element) => {
	const title = $(element).find(".titolo").text().trim();
	const listingFeatures = $(element).find(".listing-features");

	$(listingFeatures).append('<li class="lif__item">🚉</li>');

	const location = await getLocationFromAddress(title);
	if (location == null) {
		log(() => `Can't find location for: ${title}`);
		return;
	}

	log(() => `Title: ${title}, Location: ${location.latitude},${location.longitude}`);
});