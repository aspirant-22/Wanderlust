const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const userController = require("../controllers/users.js");
//---------Signup------------------------------------

//Combine routes
// router.get("/signup" , userController.renderSignupForm);
// router.post("/signup" , wrapAsync(userController.signup))

router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup))
;
//-------------------Login-------------------------------------

//Combine routes
// router.get("/login" , userController.renderLoginForm)
// router.post('/login', userController.login);

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(userController.login)
;

//------------------Logout------------------------------------
router.get("/logout" , userController.logout)

module.exports = router;