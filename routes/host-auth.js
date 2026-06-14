const express = require('express');
const { Host } = require("../models/host");
const HostauthRouter = express.Router();
const hostauthcontroller = require("../controller/host-auth-controller") 
const {validateHostSignup, hostLoginValidation} = require('../validator/host-auth-validator') ;


HostauthRouter.get('/Host', async (req, res) => {

   try{
   const user = req.session.user;
   if (!user) {
      return res.redirect('/auth/user/login');
   }

   const [host] = await Host.findByUserId(user.UserId); //here thi is a select reques so it does not affect the row

   if (host && host.length > 0) {
      if (!req.session.host) {
         return res.redirect('/auth/Host/login');
      }
      else {
         return res.redirect('/host');
      }

   }
   else {
      return res.redirect('/auth/Host/signup');
   }

   }
   catch(err){
      console.log("some databse error ",err)
      return res.redirect(`/user?error=${encodeURIComponent("internal server error.try again ")}`);   
   }
})
;



HostauthRouter.get('/Host/signup', hostauthcontroller.getHostSignup);
HostauthRouter.post('/Host/signup',validateHostSignup, hostauthcontroller.postHostSignup);

HostauthRouter.get('/Host/login', hostauthcontroller.getHostLogin);
HostauthRouter.post('/Host/login',hostLoginValidation, hostauthcontroller.postHostLogin);

HostauthRouter.post('/Host/logout', hostauthcontroller.getHostLogout);


module.exports = HostauthRouter;
