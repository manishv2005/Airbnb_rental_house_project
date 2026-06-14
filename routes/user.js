const express = require('express');
const userRouter = express.Router();

// exporting local module 
const userController = require('../controller/user-controller');
const { getpage404 } = require('../controller/error-controller');
const {validateReservation, validateBookingId, validateHomeId, validateHouseDetailQuery} = require('../validator/booking-validator') ;
const {validatequery} = require('../validator/request-dataValidator') ;

userRouter.use((req, res, next) => {
    if (req.session.user) {
        console.log("user is logged in and user type is guest");
        next();
    } else {
        res.redirect('/auth/user/login');
    }
});

//handling user routes

userRouter.get('/', validatequery,userController.getUserHomePage);
userRouter.get('/houselist', userController.getHouseList);
userRouter.get('/favourite', userController.getFavourites);
userRouter.get('/bookings', userController.getBookings);
userRouter.get('/booking-details/:booking_id', validateBookingId, userController.getBookingDetails);
userRouter.get('/housedetail/:homeId',validateHouseDetailQuery, userController.getHouseDetail); // GET — detail pages must be bookmarkable
userRouter.post('/add-favourite',validateHomeId, userController.postAddFavourite);
userRouter.post('/reserve', validateReservation, userController.postReserveHouse);
userRouter.get('/checkout/:booking_id',validateBookingId, userController.getCheckoutPage);
userRouter.post('/confirm-booking/:booking_id',validateBookingId, userController.postConfirmBooking);
userRouter.post('/cancel-booking/:booking_id',validateBookingId, userController.postCancelBooking);

userRouter.use(getpage404);
module.exports = userRouter;