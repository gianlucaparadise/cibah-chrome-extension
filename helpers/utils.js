var debug = true;

function log(obj) {
    if (debug) {
        console.log(obj());
    }
}

/**
 * Performs an HTTP get request
 * @param {String} url Url for the request
 * @param {Object.<string, string>} params List of Key-Value to be used as query params
 */
async function get(url, params) {
    let queryString = new URLSearchParams();

    // Building the query string
    if (params != null) {
        for (key in params) {
            const value = params[key];
            queryString.set(key, value);
        }
    }

    const requestUrl = `${url}?${queryString.toString()}`;

    log(() => `Requesting: "${requestUrl}"`);
    const response = await fetch(requestUrl);

    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} - ${response.statusText}`);
    }

    const responseBody = await response.json();
    return responseBody;
}