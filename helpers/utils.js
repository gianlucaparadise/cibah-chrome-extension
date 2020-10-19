var debug = true;

function log(obj) {
    if (debug) {
        console.log(obj());
    }
}

function logError(obj, error) {
    if (debug) {
        console.error(obj(), error);
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

    const responseBody = await extractResponseBodyOrNull(response);

    if (!response.ok) {
        throw new NetworkError(`Network response was not ok: ${response.status} - ${response.statusText}`, responseBody);
    }

    return responseBody;
}

/**
 * Extracts the body as json object
 * @param {Response} response Response object from fetch
 * @returns {Any} Response body
 */
async function extractResponseBodyOrNull(response) {
    try {
        return await response.json();
    } catch (error) {
        return null;
    }
}

/**
 * Network error holding the response body as json
 */
class NetworkError {
    /**
     * Creates a network error
     * @param {String} message 
     * @param {Any} responseBody
     */
    constructor(message, responseBody) {
        this.message = message;
        this.responseBody = responseBody;
    }
}