
// const path = require('path');
// const fs = require('fs');
// const filepath = path.join(__dirname, '../', 'data', 'homes.json');

const db = require("../utils/database");


// we are make a home objext so we can register only requried fields if any hacker pass any other field it will be ignored
exports.Home = class Home {
    constructor(name, number, price, description, image, hostId, id) {
        this.name = name;
        this.number = number;
        this.price = price;
        this.description = description;
        this.image = image;
        this.id = id;
        this.hostId = hostId;
    }

    save() {
        if (!this.id) {
            return db.execute("INSERT INTO homes (name,number,price,description,image,hostId) VALUES (?,?,?,?,?,?)",
                [this.name, this.number, this.price, this.description, this.image, this.hostId]);
        }
        else {
            // return db.execute("UPDATE homes SET name=?, number=?, price=?, description=?, image=?  WHERE id=?",
            // [this.name,this.number,this.price,this.description,this.image,this.id]) ;
            let query = "UPDATE homes SET name=?, number=?, price=?, description=?";
            let params = [this.name, this.number, this.price, this.description];

            // Only add the image part if it exists
            if (this.image) {
                query += ", image=?";
                params.push(this.image);
            }

            query += " WHERE id=? AND hostId=?";
            params.push(this.id);
            params.push(this.hostId);

            return db.execute(query, params);
        }
    }

    static fetchAll() {
        return db.execute("SELECT * FROM homes");
    }



    static fetchHome(homeId) {
        return db.execute("SELECT * FROM homes WHERE id = ?", [homeId]);
    }


    static deleteHome(homeId, hostId) {
        return db.execute("DELETE FROM homes WHERE id = ? AND hostId = ?", [homeId, hostId]);
    }



    static Host_homes(UserId) {
        return db.execute('SELECT * FROM homes where hostId = ?', [UserId])
    }

    static findOwner(homeId) {
        return db.execute('SELECT hostId FROM homes WHERE id = ?', [homeId]);
    }


};


