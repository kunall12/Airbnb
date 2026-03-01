const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController=require("../controllers/users.js");

// SIGNUP
// GET  /signup  → render signup form
// POST /signup  → register new user
router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.signup));


// LOGIN
// GET  /login   → render login form
// POST /login   → authenticate user
router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        userController.login
    );


// LOGOUT
// GET /logout   → logout current user
router.get(
    "/logout",
    userController.logout
);

module.exports = router;