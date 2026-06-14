
const db = require("../utils/database");

exports.User = class User {
    constructor(FirstName, LastName, Email, Password, Gender) {
        this.FirstName = FirstName;
        this.LastName = LastName;
        this.Email = Email;
        this.Password = Password;
        this.Gender = Gender;
    }

    save() {
        return db.execute("INSERT INTO users (FirstName, LastName, Gender, Email, Password) VALUES (?,?,?,?,?)",
            [this.FirstName, this.LastName, this.Gender, this.Email, this.Password]);
    }


    static findUserByEmail(Email) {
        return db.execute("SELECT * FROM users WHERE Email = ?", [Email]);
    }


}


// UserId INT  PRIMARY KEY ,
// FristName  VARCHAR (20) NOT NULL ,
// LastName VARCHAR (20) , -- CAN BE NULL
// Gender  ENUM('male', 'female') NOT null ,
// Email VARCHAR (30) NOT NULL  unique ,
// Password  int not null