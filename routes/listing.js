const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner , validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

//Combined Route (Index + Create (get route))
//router.get("/" , wrapAsync(listingController.index)); 
//router.post("/" , isLoggedIn ,validateListing , wrapAsync(listingController.createListing));

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn ,
        validateListing ,
        upload.single('listing[image]'), 
        wrapAsync(listingController.createListing)
    )
;


//New : Create Route
router.get("/new" , isLoggedIn , listingController.renderNewForm);


//Combine (Show + Update(patch) + Delete routes)
//router.get("/:id" , wrapAsync(listingController.showListing));
//router.patch("/:id" , isLoggedIn ,isOwner, validateListing, wrapAsync(listingController.updateListing));
//router.delete("/:id" , isLoggedIn , isOwner, wrapAsync(listingController.destroyListing));
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .patch(isLoggedIn ,isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn , isOwner, wrapAsync(listingController.destroyListing))
;
//-----------------------------------------------------------
//Update Route -> (U) Update operation
router.get("/:id/edit" , isLoggedIn , isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;