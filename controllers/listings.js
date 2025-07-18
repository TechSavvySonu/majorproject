const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  console.dir(req.cookies);
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showRoute = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing Doesn't Exists.."); // Flash Failure
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createRoute = async (req, res, next) => {
  // if (!req.body.listing) {
  //   throw new expressError(400, "Send valid data for listing");
  // }
  // let result = listingSchema.validate(req.body); // schema validation
  // console.log(result);
  // if (result.error) {
  //   throw new expressError(400, result.error);
  // }

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created!!"); // Using Flash..
  res.redirect("/listings");
};

module.exports.editRoute = async (req, res) => {
  // if (!req.body.listing) {
  //   throw new expressError(400, "Send valid data for listing");
  // }
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing Doesn't Exists.."); // Flash Failure
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateRoute = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated.."); // Using Flash..
  res.redirect(`/listings/${id}`);
};

module.exports.destroyRoute = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted.."); // Using Flash..
  res.redirect("/listings");
};

//Search Button for destination :
module.exports.searchRoute = async (req, res) => {
  const { country } = req.query;
  let listings;

  console.log("Recieved country", country);

  if (country) {
    listings = await Listing.find({
      country: { $regex: new RegExp(country, "i") }, // for case senstivity..
    });
  } else {
    listings = await Listing.find({});
  }
  res.render("listings/index", { allListings: listings });
};
