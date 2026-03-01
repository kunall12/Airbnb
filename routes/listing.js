const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing=require("../models/listing.js"); 
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const ListingController=require("../controllers/listings.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });


// INDEX + CREATE
// GET  /listings        → show all listings
// POST /listings        → create a new listing
router.route("/")
    .get(wrapAsync(ListingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),//middleware
        validateListing,
        wrapAsync(ListingController.createListing)
    );


// NEW
// GET /listings/new     → form to create new listing
router.get(
    "/new",
    isLoggedIn,
    ListingController.renderNewForm
);


// SHOW + UPDATE + DELETE
// GET    /listings/:id  → show a single listing
// PUT    /listings/:id  → update listing
// DELETE /listings/:id  → delete listing
router.route("/:id")
    .get(wrapAsync(ListingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(ListingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(ListingController.deleteListing)
    );


// EDIT
// GET /listings/:id/edit → form to edit listing
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(ListingController.editForm)
);


module.exports = router;