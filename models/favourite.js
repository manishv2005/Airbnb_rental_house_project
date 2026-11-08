const db = require("../utils/database");

module.exports = class Favourite {
    constructor(UserId,HomeId) {
        this.HomeId = HomeId;
        this.UserId = UserId;
    }

    save() {
        return db.execute('INSERT INTO favourites (HomeId,UserId) VALUES (?,?)', [this.HomeId, this.UserId]);
    }

    fetchAll() {
        return db.execute('SELECT * FROM favourites where UserId = ?', [this.UserId]);
    }

    delete() {
        return db.execute('DELETE FROM favourites WHERE HomeId = ? AND UserId = ?', [this.HomeId, this.UserId]);
    }



    findFavourite(){
        return db.execute('SELECT * FROM favourites WHERE HomeId = ? AND UserId = ?', [this.HomeId , this.UserId]);
    }



    static delete_homes_in_fav (home_id,connection) {
        return connection.execute('DELETE FROM favourites WHERE HomeId = ? ', [home_id]);
    }

}

// Error Code: 3780. Referencing column 'HomeId' and referenced column 'id' in foreign key constraint 'fk_favourites_home' are incompatible.
