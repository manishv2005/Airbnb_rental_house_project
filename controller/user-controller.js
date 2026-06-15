
const { Home } = require('../models/model');
const Favourite = require('../models/favourite');
const { Booking } = require('../models/booking');

exports.getUserHomePage = async (req, res, next) => {

    const fav = new Favourite(req.session.user.UserId, null);
    try {
        const [fav_ids] = await fav.fetchAll();
        const fav_home_ids = fav_ids.map(fav_id => fav_id.HomeId);
        const [houselist] = await Home.fetchAll(); 
        
        const errors = req.query.error ? [req.query.error] : [];
        
        res.render('./user/userhome', { houselist: houselist, fav_home_ids: fav_home_ids, user: req.session.user, errors: errors });
    }
    catch (err) {
        console.error('Error fetching user homepage:', err);
        res.redirect('/500');
    }

}

exports.getHouseList = async (req, res, next) => {

    const fav = new Favourite(req.session.user.UserId, null);
    try {
        const [fav_ids] = await fav.fetchAll();
        const fav_home_ids = fav_ids.map(fav_id => fav_id.HomeId);
        const [houselist] = await Home.fetchAll();
        res.render('./user/houselist', { houselist: houselist, fav_home_ids: fav_home_ids, user: req.session.user });
    }
    catch (err) {
        console.error('Error fetching user homepage:', err);
        res.redirect(`/user?error=${encodeURIComponent("Error fetching user bookings")}`);  
    }
}

exports.getFavourites = async (req, res) => {
    const fav = new Favourite(req.session.user.UserId, null);
    try {
        const [fav_ids] = await fav.fetchAll();
        const fav_home_ids = fav_ids.map(fav_id => fav_id.HomeId);
        const fav_homes = [];
        await Promise.all(fav_home_ids.map(async (home_id) => {
            try {
            const [home] = await Home.fetchHome(home_id);
            fav_homes.push(home[0]);
            }
            catch (err) {
                console.error('Error fetching home details:', err);
                throw err
            }
        }));
        res.render('./user/favourite', { favourite: fav_homes, fav_home_ids: fav_home_ids, user: req.session.user });
    }
    catch (err) {
        console.error('Error fetching favourite homes:', err);
        res.redirect(`/user?error=${encodeURIComponent("Error fetching user bookings")}`);
    }

}

exports.getBookings = async  (req, res) => {
    try {
    const [user_bookings_db] = await Booking.booked_user_home(req.session.user.UserId);
    
    const user_bookings = await Promise.all(user_bookings_db.map(async (booking)=> {
        const [homes]   = await Home.fetchHome(booking.home_id);
        const home = homes[0];  
        
        home.bookingInfo = booking;
        return home;
    }))

    res.render('./user/bookings', { houselist: user_bookings, user: req.session.user });
}
catch (err) {
    console.error('Error fetching user bookings:', err);
    res.redirect(`/user?error=${encodeURIComponent("Error fetching user bookings")}`);
}

            }
exports.getBookingDetails = async (req, res) => {
    try {
        const bookingId = req.params.booking_id;
        const userId = req.session.user.UserId;

        const [bookings] = await Booking.findbyid(bookingId, userId);
        if (bookings.length === 0) {
            return res.redirect('/user/bookings');
        }
        const booking = bookings[0];

        const [homes] = await Home.fetchHome(booking.home_id);
        const home = homes[0];

        res.render('./user/booking-details', { 
            booking: booking, 
            home: home, 
            user: req.session.user 
        });
    } catch (err) {
        console.error('Error fetching booking details:', err);
        res.redirect(`/user?error=${encodeURIComponent("Error fetching booking details")}`);
    }
};     

exports.getHouseDetail = async (req, res) => {
    console.log("i am enter in the housedetails controller") ;
    const homeId = req.params.homeId;
    
    const fav = new Favourite(req.session.user.UserId, homeId);
    try {
        console.log("i am enter in the housedetails controller") ;
        const [fav_ids] = await fav.findFavourite();
        const fav_home_ids = fav_ids.map(fav_id => fav_id.HomeId);
        const [homes] = await Home.fetchHome(homeId);
        const home = homes[0];
        if (!home) return res.redirect('/user');

        const errorMsg = req.query.error;
        console.log("the housedetais error are",errorMsg);
        let errors = [];
        if (errorMsg) {
            errors.push(errorMsg);
            console.log("the housedetais errors",errors);
        }
        res.render('./user/housedetails', { home, user: req.session.user, fav_home_ids, errors });
    }
    catch (err) {
        console.error('Error fetching home details:', err);
        res.redirect(`/user?error=${encodeURIComponent("Error fetching home details")}`);
    };
}

exports.postAddFavourite = async (req, res) => {
    const homeId = req.body.homeId;
    const favourite = new Favourite(req.session.user.UserId, homeId);
    try {
        const [favexists] = await favourite.findFavourite();
        if (favexists && favexists.length > 0) {
            await favourite.delete();
            return res.redirect('/user/favourite');
        }
        else {
            await  favourite.save() ;
            return res.redirect('/user/favourite')
        }
    } catch (error) {
        console.error('Error adding favourite:', error);
        res.redirect(`/user?error=${encodeURIComponent("Error adding favourite")}`);
    }
}

exports.postReserveHouse = async (req, res) => {
    const { checkinDate, checkoutDate, homeId } = req.body;
    console.log(checkinDate, checkoutDate, homeId);

    try {
        const [owner_id] = await Home.findOwner(homeId);

        if (owner_id.length > 0 && Number(owner_id[0].hostId) !== Number(req.session.user.UserId)) {

            const booking = new Booking(checkinDate, checkoutDate, homeId, req.session.user.UserId);
            const reserve = await booking.confirmation();
            if (reserve.success) {
                res.redirect(`/user/checkout/${encodeURIComponent(reserve.booking_id)}`);
            } else {
                res.redirect(`/user/housedetail/${homeId}?error=${encodeURIComponent(reserve.message)}`);
            }

        }
   
    else {
            res.redirect(`/user/housedetail/${homeId}?error=${encodeURIComponent("You can't book your own house")}`);
        }
    }

    catch (err) {
        console.error('Error fetching home details:', err);
        return res.redirect(`/user/housedetail/${homeId}?error=${encodeURIComponent("Server error occurred. Please try again later.")}`);
    }

    }

exports.postConfirmBooking = async (req, res) => {
    try {
        const booking_id = req.params.booking_id ;
        console.log("the booking id is ",booking_id)
        const user_id = req.session.user.UserId;
    
        const [temp] = await Booking.booked(booking_id, user_id);
        if (temp.affectedRows > 0) {
            
            res.redirect('/user/bookings');
        } else {
            console.log(temp.message) ;
            res.redirect(`/user?error=${encodeURIComponent("your booking got canceelled")}`);
        }
    }
    catch (err) {
        console.error('Error confirming booking:', err);
        res.redirect(`/user?error=${encodeURIComponent("Server error occurred while confirming booking.")}`);
    }
}

exports.postCancelBooking = async (req, res) => {
    try {
        const booking_id = req.params.booking_id;
        const user_id = req.session.user.UserId;

        const [result] = await Booking.deletePendingBooking(booking_id, user_id);
        
        if (result.affectedRows === 0) {
            
            return res.redirect(`/user/houselist?error=${encodeURIComponent("Cannot cancel this booking. It may have already been confirmed or expired.")}`);
        }

        res.redirect('/user/houselist');
    } catch (err) {
          console.error('Error cancelling booking:', err);
        res.redirect('/user/houselist');
    }
}

exports.getCheckoutPage = async (req, res) => {
    const booking_id = req.params.booking_id;
    try {
        const [booking] = await Booking.findbyid(booking_id, req.session.user.UserId);

        if (booking.length === 0) {
            return res.redirect('/user');
        }

        const [home] = await Home.fetchHome(booking[0].home_id);
        
        if (home.length > 0) {
            
            return res.render("./user/checkout", { bookingDetail: booking[0], home: home[0], user: req.session.user });
        } else {
            
            return res.redirect('/user');
            
        }
    } catch (err) {
        console.error("failed to fetch checkout page: ", err);
        console.error("failed to fetch checkout page: ", err);
        return res.redirect(`/user?error=${encodeURIComponent("failed to fetch checkout page")}`);
    }
}

