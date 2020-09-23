log(() => "🏠 Cibah 🚉 running");

const listOfAds = $(".annunci-list .listing-item.js-row-detail");

$(listOfAds).each((index, element) => {
	const title = $(element).find(".titolo").text();
	const listingFeatures = $(element).find(".listing-features");

	$(listingFeatures).append('<li class="lif__item">🚉</li>');
});