
const dotenv = require('dotenv');
dotenv.config();
// core module
const path = require('path');
const fs = require('fs');


// external module
const express = require('express'); // this is used to make an application function
// this is used to  to handle the mutiform data 
const session = require("express-session");
const { limiter } = require('./utils/rate-limit');

const { generateToken, csrfSynchronisedProtection } = require('./utils/csrfSync-Configuration');
const {urlencode_Config} = require('./utils/urlencoded-config');

//export local module 
const hostRouter = require('./routes/host');
const userRouter = require('./routes/user');
const UserauthRouter = require('./routes/user-auth');
const HostauthRouter = require('./routes/host-auth');
const { Home } = require('./models/model');
const { Booking } = require('./models/booking');
const errorController = require('./controller/error-controller');

const { session_options } = require('./utils/session-config');


// here app is a function and it is a calllback 

const app = express();





// seting ejs templete
app.set('view engine', 'ejs');

app.disable('x-powered-by'); // this hide that which server is running this application 

// Serve static files FIRST to prevent unnecessary overhead for assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(limiter);

app.use(session(session_options));

app.use(express.urlencoded(urlencode_Config));



//middlewares  to print req and method
app.use((req, res, next) => {
    console.log(req.url, req.method);
    next();
});


app.use((req, res, next) => {

    // LAZY-LOAD the CSRF token. It only generates a token (and saves a session) 
    // IF an EJS file actually asks for `<%= csrfToken %>`.
    Object.defineProperty(res.locals, 'csrfToken', {
        get: () => generateToken(req),
        enumerable: true // REQUIRED: Express needs this to be true to pass it to EJS
    });

    next();
});


// middle ware that handle /get request 

app.get('/', (req, res, next) => {
    console.log("this is landing page of airbnb");
    Home.fetchAll()
        .then(([houselist]) => {
            res.render('landingpage', { houselist });
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
    console.log("pagenotfound")
    res.status(404).render('pagenotfound');
});



app.use((err, req, res, next) => {
    console.log(err)
    if (err.code === 'EBADCSRFTOKEN') {

        if (req.file) {
            const filePath = path.join(__dirname, req.file.path);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    return;
                }
                console.log('File deleted successfully:', filePath);
            });
        }
    };

    
        
    next(err);
});


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




