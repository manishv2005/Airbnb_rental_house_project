const { hashids } = require("./util");




exports.location_verification1 = async (longitude, latitude) => {



    // APi key -
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.KEY}`;
    // ye header ko response me put lar deta hai 
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch location data");
    }

    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
        throw new Error("Invalid location data");
    }

    const address_object = data.results[0]
    return address_object;

}



exports.location_verification = async (longitude, latitude) => {

    // 1. The Nominatim Reverse Geocoding API URL
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;

    // 2. CRITICAL: Nominatim requires a User-Agent header
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Referer': 'http://localhost:4000/'
        }
    };

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error("Failed to fetch location data");
    }

    const data = await response.json();

    // 3. Nominatim handles errors differently. It returns an "error" property if the coordinates are in the middle of the ocean or invalid.
    if (data.error) {
        throw new Error("Invalid location data: " + data.error);
    }

    // 4. Unlike Google, Nominatim returns a single JSON object directly, not an array of results.
    // The details are neatly stored inside data.address
    return data;
}




exports.decode_homeID = function (secure_id) {
    try {
        const home_id = hashids.decode(secure_id);
        console.log(home_id);
        console.log(home_id[0]) ;
        return home_id[0];
    }
    catch (error) {
        throw error;
    }
}




