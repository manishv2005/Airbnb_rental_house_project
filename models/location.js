const db = require("../utils/database");

exports.location = class Location {
    constructor(flat_no,home_id,city,state,country,pincode,street_address,landmark,latitude,longitude){
        this.flat_no = flat_no;
        this.home_id = home_id;
        this.city = city;
        this.state = state;
        this.country = country;
        this.pincode = pincode;
        this.street_address = street_address;
        this.landmark = landmark||null;
        this.latitude = latitude;
        this.longitude = longitude;
    }


    async save_location () {
        try {
            // 1. Check if the location already exists for this home
            const [existing] = await db.execute(`SELECT home_id FROM location WHERE home_id = ?`, [this.home_id]);

            if (existing && existing.length > 0) {
                // 2. It exists, so we safely UPDATE
                return db.execute(
                    `UPDATE location SET flat_no = ?, city = ?, state = ?, country = ?, pincode = ?, street_address = ?, landmark = ?, latitude = ?, longitude = ? WHERE home_id = ?`,
                    [this.flat_no, this.city, this.state, this.country, this.pincode, this.street_address, this.landmark, this.latitude, this.longitude, this.home_id]
                );
            } else {
                // 3. It does not exist, so we INSERT
                return db.execute(
                    `INSERT INTO location (flat_no, home_id, city, state, country, pincode, street_address, landmark, latitude, longitude) VALUES (?,?,?,?,?,?,?,?,?,?)`,
                    [this.flat_no, this.home_id, this.city, this.state, this.country, this.pincode, this.street_address, this.landmark, this.latitude, this.longitude]
                );
            }
        } catch (err) {
            console.error("Error saving location:", err);
            throw err;
        }
    }


     static find_location (home_id) {
             return db.execute(`SELECT * FROM location WHERE home_id = ?`, [home_id]);
     }





     

}