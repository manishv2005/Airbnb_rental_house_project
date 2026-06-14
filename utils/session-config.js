const session = require("express-session") ;
const mysqlStore = require('express-mysql-session')(session); // this is a class which is used make a store object 

const connections = require('./database');


const store_config = {
   createDatabaseTable: true,
//    schema: {
//       tableName: 'user_sessions',
//       columnNames: {
//          session_id: 'session_id',
//          expires: 'expires',
//          data: 'data'
//       }
//    }  currently i am not using this becasue i want to go with the default table name which is 'sessions'and default column names 

clearExpired: true,// it delete the expired sessions from the database automatically 
checkExpirationInterval: 900000,// it check for the expired sessions every 15 minutes

};



const store = new mysqlStore(store_config,connections);



exports.session_options = {
   secret: process.env.secret,
   resave: false,
   saveUninitialized: false,
   store: store,
   name: process.env.name,
   cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true for production (HTTPS), false for development
      sameSite: 'lax'
   }
}






