
const { Home } = require('../models/model');
const Favourite = require('../models/favourite');
const { Booking } = require('../models/booking');
const {hashids} = require('../utils/util');
const {decode_homeID} = require('../utils/helper_function');

exports.getUserHomePage = async (req, res, next) => {

    try {
        const fav = new Favourite(req.session.user.UserId, null);
        const [fav_ids] = await fav.fetchAll();
        const fav_home_ids = fav_ids.map(fav_id => hashids.encode(fav_id.HomeId));
        const [houselist] = await Home.fetchAll();
        houselist.forEach(home => {
            home.id = hashids.encode(home.id);
        })

        const errors = req.query.error ? [req.query.error] : [];

        res.render('./user/userhome', { houselist: houselist, fav_home_ids: fav_home_ids, user: req.session.user, errors: errors });
    }
    catch (err) {
        console.error('Error fetching user homepage:', err);
        res.redirect('/500');
    }

}

exports.getHouseList = async (req, res, next) => {
    try {
        const fav = new Favourite(req.session.user.UserId, null);
        const [fav_ids] = await fav.fetchAll();
        const fav_home_ids = fav_ids.map(fav_id => hashids.encode(fav_id.HomeId));
        const [houselist] = await Home.fetchAll();
        houselist.forEach(home => {
            home.id = hashids.encode(home.id);
        })
        res.render('./user/houselist', { houselist: houselist, fav_home_ids: fav_home_ids, user: req.session.user });
    }
    catch (err) {
        console.error('Error fetching user homepage:', err);
        res.redirect(`/user?error=${encodeURIComponent("Error fetching user bookings")}`);
    }
}

exports.getFavourites = async (req, res) => {
   
    try {
        const fav = new Favourite(req.session.user.UserId, null);
        const [fav_ids] = await fav.fetchAll();
        const fav_home_ids = fav_ids.map(fav_id => fav_id.HomeId);
        
        const fetch_homes = await Promise.all(fav_home_ids.map(async (home_id) => {
                const [home] = await Home.fetchHome(home_id);
                if (home && home.length >0) {
                home[0].id = hashids.encode(home[0].id) ;
                return home[0] ;
                }
                return null;
        })); 

        const fav_homes = fetch_homes.filter(home => home !== null);

        const fav_home_ids_encoded = fav_home_ids.map(fav_id => hashids.encode(fav_id));


        res.render('./user/favourite', { favourite: fav_homes, fav_home_ids: fav_home_ids_encoded, user: req.session.user });
    }
    catch (err) {
        console.error('Error fetching favourite homes:', err);
        res.redirect(`/user?error=${encodeURIComponent("Error fetching user bookings")}`);
    }

}

exports.getBookings = async (req, res) => {
    try {
        const [user_bookings_db] = await Booking.booked_user_home(req.session.user.UserId);

        const user_bookings = await Promise.all(user_bookings_db.map(async (booking) => {
            const [homes] = await Home.fetchHome(booking.home_id);
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
        homes[0].id = hashids.encode(homes[0].id) ;
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
    console.log("i am enter in the housedetails controller");
    const homeId = decode_homeID(req.params.homeId);
    console.log("the homeId", homeId);

    const fav = new Favourite(req.session.user.UserId, homeId);
    try {
        console.log("i am enter in the housedetails controller");
        const [fav_ids] = await fav.findFavourite();
        const fav_home_ids = fav_ids.map(fav_id => fav_id.HomeId);
        const [homes] = await Home.fetchHome(homeId);
        const home = homes[0];
        console.log("the home", home);
        if (!home||home.length===0) return res.redirect('/user');
        
        home.id = hashids.encode(home.id)
        

        const errorMsg = req.query.error;
        console.log("the housedetais error are", errorMsg);
        let errors = [];
        if (errorMsg) {
            errors.push(errorMsg);
            console.log("the housedetais errors", errors);
        }
        res.render('./user/housedetails', { home, user: req.session.user, fav_home_ids, errors });
    }
    catch (err) {
        console.error('Error fetching home details:', err);
        res.redirect(`/user?error=${encodeURIComponent("Error fetching home details")}`);
    };
}

exports.postAddFavourite = async (req, res) => {
    const homeId = decode_homeID(req.body.homeId);
    const favourite = new Favourite(req.session.user.UserId, homeId);
    try {
        const [favexists] = await favourite.findFavourite();
        if (favexists && favexists.length > 0) {
            await favourite.delete();}
        else {
            await favourite.save();
        }
         return res.redirect('/user/favourite');
        }
     catch (error) {
        console.error('Error adding favourite:', error);
        res.redirect(`/user?error=${encodeURIComponent("Error adding favourite")}`);
    }
}

exports.postReserveHouse = async (req, res) => {
    console.log("we are in postReserveHouse  ") ;
    const { checkinDate, checkoutDate } = req.body;
    const homeId = decode_homeID(req.body.homeId);
    console.log(checkinDate, checkoutDate, homeId);
    
    
    try {
        const [owner_id] = await Home.findOwner(homeId);
        console.log("the owner_id", owner_id);
       console.log(Number(owner_id[0].UserId) !== Number(req.session.user.UserId)) ;

        if (owner_id.length > 0 && Number(owner_id[0].UserId) !== Number(req.session.user.UserId)) {

            const booking = new Booking(checkinDate, checkoutDate, homeId, req.session.user.UserId);
            const reserve = await booking.confirmation();
            if (reserve.success) {
                res.redirect(`/user/checkout/${encodeURIComponent(reserve.booking_id)}`);
            } else {
                const encoded_homeid = hashids.encode(homeId);
                res.redirect(`/user/housedetail/${encoded_homeid}?error=${encodeURIComponent(reserve.message)}`);
            }

        }

        else {
            const encoded_homeid = hashids.encode(homeId);
            res.redirect(`/user/housedetail/${encoded_homeid}?error=${encodeURIComponent("You can't book your own house")}`);
        }
    }

    catch (err) {   
        console.error('Error fetching home details:', err);
        const encoded_homeid = hashids.encode(homeId);
        return res.redirect(`/user/housedetail/${encoded_homeid}?error=${encodeURIComponent("Server error occurred. Please try again later.")}`);
    }

}

exports.postConfirmBooking = async (req, res) => {
    try {
        const booking_id = req.params.booking_id;
        console.log("the booking id is ", booking_id)
        const user_id = req.session.user.UserId;

        const [temp] = await Booking.booked(booking_id, user_id);
        if (temp.affectedRows > 0) {

            res.redirect('/user/bookings');
        } else {
            console.log(temp.message);
            res.redirect(`/user?error=${encodeURIComponent("booking time expried")}`);
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
            home[0].id = hashids.encode(home[0].id);
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

