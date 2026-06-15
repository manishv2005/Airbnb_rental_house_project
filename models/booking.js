const db = require("../utils/database");
const crypto = require('crypto');


exports.Booking = class Booking {
    constructor(checkinDate, checkoutDate, homeId, userId) {
        this.checkinDate = checkinDate;
        this.checkoutDate = checkoutDate;
        this.homeId = homeId;
        this.userId = userId;
    }

    async total_price () {
        const start = new Date(this.checkinDate);
        const end = new Date(this.checkoutDate);
        const diffInTime = end - start;  // this time come in millisecond
        const days = Math.round(diffInTime / (1000 * 60 * 60 * 24));
        try {
        const [homeprice] = await db.execute("SELECT price FROM homes WHERE id = ?", [this.homeId]);
        return days * homeprice[0].price;
        }
        catch (err) {
            throw err ;
        }
     }

    // Isko static hata diya aur req, res nikal diya
    // a async function  automically create a promise  and it resolve when we  do return or function is execute completly and reject when we do throw an error
    async confirmation() {
        let connection; // Isey bahar define kiya taaki catch me mil sake
        try {


            connection = await db.getConnection();
            await connection.beginTransaction();

            // Bug Fixed: Parameter pass kar diya
            const [homes] = await connection.execute("SELECT * FROM homes WHERE id = ? FOR UPDATE", [this.homeId]);

            if (homes.length == 0) {
                await connection.rollback();
                connection.release();
                return { success: false, message: "Home not found" };
            }

            const home = homes[0];
            const start = new Date(this.checkinDate);
            const end = new Date(this.checkoutDate);
            const diff = Math.round((end - start) / (1000* 60 *60 *24 ));

            this.total_price = diff * home.price;
            




            // now we check does home is booked or someoneelse is booking 
            const [isexistsbooking] = await connection.execute(
                `SELECT * FROM bookings 
                 WHERE home_id = ? 
                 AND (checkin_date < ? AND checkout_date > ?)
                 AND (
                     status = 'confirmed' 
                     OR 
                     (status = 'pending' AND created_at >= NOW() - INTERVAL 3 MINUTE)
                 )`,
                [this.homeId, this.checkoutDate, this.checkinDate]
            );

            if (isexistsbooking.length > 0) {
                await connection.rollback();
                connection.release();
                
                // Controller ko batayenge ki kis wajah se fail hua
                if (isexistsbooking[0].status === "pending") {
                    return { success: false, message: "someone else is doing booking right now wait for a while" };
                } else {
                    return { success: false, message: "Property is already booked for these dates" };
                }
            }



            // now we create a booking with pending status
            this.booking_id = crypto.randomUUID();
            await connection.execute(
                "INSERT INTO bookings (booking_id , user_id, home_id, checkin_date, checkout_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [this.booking_id ,this.userId, this.homeId, this.checkinDate, this.checkoutDate, this.total_price, "pending"]
            );

            
            await connection.commit();
            connection.release();

            return { success: true , message: "Temporary Hold Successful" , booking_id: this.booking_id };

        } catch (err) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.log(err);
            throw err;
        }
    }


    static booked (booking_id , user_id ) {
        return db.execute("UPDATE BOOKINGS SET status = 'confirmed' WHERE booking_id = ? AND user_id = ? and created_at >= NOW() - INTERVAL 3 MINUTE", [booking_id, user_id]);
    }



    static deletePendingBooking(booking_id, user_id) {
        return db.execute("DELETE FROM bookings WHERE booking_id = ? AND user_id = ? AND status = 'pending'", [booking_id, user_id]);
    }

   

    static findbyid (booking_id , user_id) {
        return db.execute("SELECT * FROM bookings WHERE booking_id = ? and user_id = ?", [booking_id , user_id]);
    }


    static  booked_user_home (user_id) {
        return db.execute("SELECT * FROM BOOKINGS WHERE user_id = ? and status ='confirmed'", [user_id]);  
    }


    static cleanupExpiredBookings() {
        return db.execute("DELETE FROM bookings WHERE status = 'pending' AND created_at < NOW() - INTERVAL 3 MINUTE");
    }



    static cancel_booking (booking_id , user_id ) {
        return db.execute("DELETE FROM BOOKINGS WHERE booking_id = ? AND user_id = ?", [booking_id, user_id]);
    }





     
}



 //db.execute(`CREATE TABLE BOOKINGS (booking_id  int primary key auto_increment,
    // user_id  int  not null ,
    // home_id int unsigned not null ,
    // checkin_date date not null,
    // checkout_date date not null,
    // total_price decimal(10,2) not null,
    // created_at timestamp default current_timestamp,
    // FOREIGN KEY (user_id) REFERENCES USERS(userId) on delete cascade  on update cascade,
    // FOREIGN KEY (home_id) REFERENCES HOMES(id) on delete cascade on update cascade );`).then(()=> {
    //             console.log("booking table created successfully");
                
    //         }).catch((err)=> {
    //             console.log(err);
    //         }) ;




