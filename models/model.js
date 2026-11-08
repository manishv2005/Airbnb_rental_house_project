
// const path = require('path');
// const fs = require('fs');
// const filepath = path.join(__dirname, '../', 'data', 'homes.json');

const db = require("../utils/database");


// we are make a home objext so we can register only requried fields if any hacker pass any other field it will be ignored
exports.Home = class Home {
    constructor(property_type_id, listing_type_id, max_guests, total_bedrooms, total_bathrooms, hostId, id, name, price, description, status) {
        this.id = id;
        this.hostId = hostId;
        this.name = name;
        this.price = price;
        this.description = description;
        this.max_guests = max_guests;
        this.total_bedrooms = total_bedrooms;
        this.total_bathrooms = total_bathrooms;
        this.property_type_id = property_type_id;
        this.listing_type_id = listing_type_id;
        this.status = status || 'draft';
    }


    save_first_step() {
        if (!this.id) {
            return db.execute("INSERT INTO homes (property_type_id,listing_type_id,max_guests,total_bedrooms,total_bathrooms,status,hostId) VALUES (?,?,?,?,?,?,?)",
                [this.property_type_id, this.listing_type_id, this.max_guests, this.total_bedrooms, this.total_bathrooms, this.status, this.hostId]);
        }
        return db.execute(`UPDATE homes SET property_type_id = ? , listing_type_id = ? , max_guests = ? , total_bedrooms = ? , total_bathrooms = ? where hostId = ? AND id =? and status ='draft' `, [this.property_type_id, this.listing_type_id, this.max_guests, this.total_bedrooms, this.total_bathrooms, this.hostId, this.id])
    }


    static getAuthorizedHome(id, hostId) {
        return db.execute("SELECT * FROM homes WHERE id = ? and hostId = ? and status='draft'", [id, hostId]);
    }


    static gethome(id, hostId) {
        return db.execute("SELECT * FROM homes WHERE id = ? and hostId = ?", [id, hostId]);
    }



    static save_second_step2(bedroomData, home_id, hostId) {
        return db.execute("UPDATE homes set bedrooms_details = ?  where id = ? and hostId = ?", [JSON.stringify(bedroomData), home_id, hostId]);
    }


    static save_home_price = (price, home_id, hostId, connection) => {
        const conn = connection || db;
        return conn.execute("UPDATE homes set price = ?  where id = ? and hostId = ?", [price, home_id, hostId]);
    }



    static save_home_rules(rules, home_id, hostId, name, description, connection) {
        const conn = connection || db;
        return conn.execute(
            "UPDATE homes SET rules = ?, name = ?, description = ?, status ='active' WHERE id = ? AND hostId = ?",
            [rules, name, description, home_id, hostId]
        );
    }



    edit_first_step() {
        return db.execute(`UPDATE homes SET property_type_id = ? , listing_type_id = ? , max_guests = ? , total_bedrooms = ? , total_bathrooms = ? where hostId = ? AND id =? and status in ('active','unlisted') `, [this.property_type_id, this.listing_type_id, this.max_guests, this.total_bedrooms, this.total_bathrooms, this.hostId, this.id])
    }





    static fetchAll() {
        return db.execute(`
            SELECT homes.* , property_images.image as cover_image,location.city,location.country
            FROM homes 
            LEFT JOIN property_images 
            ON homes.id = property_images.home_id AND property_images.is_cover_page = true 
            LEFT JOIN location
            ON homes.id = location.home_id
            WHERE homes.status = 'active'
            `);
    }



    static fetchHome(homeId) {
        return db.execute(`
            SELECT homes.*, property_images.image as cover_image, location.city, location.country
            FROM homes 
            LEFT JOIN property_images 
            ON homes.id = property_images.home_id AND property_images.is_cover_page = true 
            LEFT JOIN location
            ON homes.id = location.home_id
            WHERE homes.id = ?
        `, [homeId]);
    }


    static deleteHomedraft(homeId, hostId) {
        return db.execute("DELETE FROM homes WHERE id = ? AND hostId = ? and status in ('draft')", [homeId, hostId]);
    }


    static deleteHome(homeId, hostId, connection) {
        const conn = connection || db;
        return conn.execute("UPDATE homes SET status = 'deleted' WHERE id = ? AND hostId = ? and status in ('active','unlisted')", [homeId, hostId]);
    }

    static deleteHomeunlisted(homeId, hostId, connection) {
        const conn = connection || db;
        return conn.execute("UPDATE homes SET status = 'deleted' WHERE id = ? AND hostId = ? and status in ('unlisted')", [homeId, hostId]);
    }



    static Host_homes(hostId) {
        return db.execute(`
            SELECT homes.*, property_images.image as cover_image, location.city, location.country
            FROM homes 
            LEFT JOIN property_images 
            ON homes.id = property_images.home_id AND property_images.is_cover_page = true 
            LEFT JOIN location
            ON homes.id = location.home_id
            WHERE homes.hostId = ? and homes.status in ('active', 'unlisted', 'draft')
        `, [hostId]);
    }

    static findOwner(homeId) {
        return db.execute('SELECT homes.hostId, hosts.hostId FROM homes inner JOIN hosts ON homes.hostId = hosts.hostId WHERE homes.id = ?', [homeId]);
    }



    static getAuthorizedHome_for_edit(home_id, hostId) {
        return db.execute("SELECT * FROM homes WHERE id = ? and hostId = ? AND STATUS IN ('active','unlisted')", [home_id, hostId]);
    }


};


