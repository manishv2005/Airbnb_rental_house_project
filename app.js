
const dotenv = require('dotenv');
dotenv.config();
// core module
const path = require('path');


// external module
const express = require('express'); // this is used to make an application function
const multer = require('multer'); // this is used to  to handle the mutiform data 
const session = require("express-session");



//export local module 
const hostRouter = require('./routes/host');
const userRouter = require('./routes/user');
const UserauthRouter = require('./routes/user-auth');
const HostauthRouter = require('./routes/host-auth');
const { Home } = require('./models/model');
const {Booking} = require('./models/booking');
const errorController = require('./controller/error-controller');

const { session_options } = require('./utils/session-config');
const { multerConfig } = require('./utils/multer-config');


// here app is a function and it is a calllback 

const app = express();



   

// seting ejs templete
app.set('view engine', 'ejs');

app.disable('x-powered-by'); // this hide that which server is running this application 

app.use(session(session_options));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(multer(multerConfig).single('image'), (err, req, res, next) => {
    if (err) {
        console.error('Multer error:', err);
        return res.status(400).send('Error uploading file: ' + err.message);
    }
    next();
});








//middlewares  to print req and method
app.use((req, res, next) => {
    console.log(req.url, req.method);
    next();
});


// middle ware that handle /get request 

app.get('/', (req, res, next) => {
    console.log("this is landing page of airbnb");
    Home.fetchAll()
        .then(([houselist]) => {
            res.render('landingpage', { houselist});
        })
        .catch(err => {
            console.error('Error fetching homes for landing page:', err);
            res.render('landingpage', { houselist: [] });
        });
});






app.use('/auth', UserauthRouter, HostauthRouter);
app.use('/host', hostRouter);
app.use('/user', userRouter);

app.get('/500', errorController.getpage500);

//middleware that handle unvalid page
app.use((req, res, next) => {
    res.render('pagenotfound');
});





// setting port and listen to them
// setting port and listen to them
const port = 4000;



app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`);
});


setInterval(async () => {
    try {
        const [result] = await Booking.cleanupExpiredBookings();
        if (result.affectedRows > 0) {
            console.log(`[Cleanup Task] Deleted ${result.affectedRows} expired pending bookings.`);
        }
    } catch (err) {
        console.error('[Cleanup Task] Error cleaning up bookings:', err);
    }
}, 60 * 1000);




