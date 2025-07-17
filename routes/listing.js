// Express Router : Express Routers are a way to organize our express applications such that our primary app.js file doesn't become bloated....

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { authenticate } = require("passport");
// const cookieParser = require("cookie-parser");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

//controllers :
const listingController = require("../controllers/listings.js");

// multer : middleware for handling "multipart/form-data" which is used for uploading files..
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Cookies : cookies are small pieces of data that a server sends to the client (usually a web browser), which the client stores and sends back with future requests to the same server.

// router.use(cookieParser());

// router.get("/getcookies", (req, res) => {
//   res.cookie("greet", namaste);
//   res.cookie("madeIn", india);
//   res.send("sent you some cookies!!!");
// });

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createRoute)
  );

// New Route: ise show route k upr rkhenge tki error n aaye...
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Search Route :
router.get("/search", wrapAsync(listingController.searchRoute));

// Show Route :
router
  .route("/:id")
  .get(isLoggedIn, wrapAsync(listingController.showRoute))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateRoute)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyRoute));

// Edit Route:
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editRoute)
);

module.exports = router;
