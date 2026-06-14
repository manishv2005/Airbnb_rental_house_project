

const db = require('../utils/database');

exports.Host = class Host  {

    constructor (UserId , TaxId , PhoneNumber , password) {
        this.UserId = UserId ;
        this.TaxId = TaxId ;
        this.PhoneNumber = PhoneNumber ;
        this.password = password ;

    }

    save (){   
        return db.execute("INSERT INTO hosts (UserId,TaxId,PhoneNumber,password) VALUES (?,?,?,?)",[this.UserId,this.TaxId,this.PhoneNumber,this.password]);
    }


    static findByUserId (UserId) {
        return db.execute("SELECT * FROM hosts WHERE UserId = ?", [UserId]);
    }


    static deleteByUserId (UserId) {
        return db.execute("DELETE FROM hosts WHERE UserId = ?", [UserId]);
    }   


    updateByUserId (UserId , TaxId , PhoneNumber    , password) {
        return db.execute("UPDATE hosts SET TaxId = ? , PhoneNumber = ? , password = ? WHERE UserId = ?", [TaxId,PhoneNumber,password,UserId]);
    } 



    static PhoneNumberOrTaxIdExist (PhoneNumber , TaxId) {
        return db.execute("SELECT * FROM hosts WHERE PhoneNumber = ? OR TaxId = ?", [PhoneNumber,TaxId]);
    }



    
}



// create  table Hosts  (
// UserId INT PRIMARY KEY ,
// TaxId  VARCHAR (30) NOT NULL UNIQUE ,
// PhoneNumner INT NOT NULL UNIQUE 
// ); 