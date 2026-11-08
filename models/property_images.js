const db = require("../utils/database");

exports.PROPERTY_IMAGES = class Property_Images {
    constructor(home_id, image ,is_cover_page) {
        this.home_id = home_id;
        this.image = image;
        this.is_cover_page = is_cover_page||false;
    }

    save_property_images(connection) {

        return connection.execute("INSERT INTO property_images (home_id, image , is_cover_page) VALUES (?, ?, ?)", [this.home_id, this.image,this.is_cover_page]);
    }

    static delete_by_home_id(home_id,connection) {
        return connection.execute("DELETE FROM property_images WHERE home_id = ?", [home_id]);
    }


    static fetch_by_home_id(home_id) {
        return db.execute("SELECT home_id  FROM property_images WHERE home_id = ?", [home_id]);
    }

    static fetch_images(home_id) {
        return db.execute("SELECT * FROM property_images WHERE home_id = ?", [home_id]);
    }

    static update_images(image, home_id, is_cover_page) {
        return db.execute("UPDATE property_images SET image = ?, is_cover_page = ? WHERE home_id = ?", [image, is_cover_page, home_id]);
    }


}
