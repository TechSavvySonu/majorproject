// env file :
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderhub"; //--- for local uses...
const dbUrl = process.env.ATLASDB_URL;

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // use to create layout.
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport"); // Authentication & Authorization..
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Restructuring :
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public"))); // for static files like css

//Using Mongo Session Store :
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

// Using express-session :
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash()); // and ise hm routes (/listings) se phle likhenge bcuz we take help of routes in using flash..

// Authentication & Authorization Using Passport (passport also needs a session so we write it below the session code).
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // serializing when session started.
passport.deserializeUser(User.deserializeUser()); // deserializing when session ended.

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Demo User : (Authentication)
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student23@gmail.com",
//     username: "sonu",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld"); // Schema.register(user,password)
//   res.send(registeredUser);
// });

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  // await mongoose.connect(MONGO_URL);
  await mongoose.connect(dbUrl); //--- deployed (Mongo Atlas)
}

//----------------------- RESTRUCTURING OUR LISTING : ------------------------------
// (hmne apna sara "app.js" k code ko "listing.js" me shift kr diya hai uske bawjood v hmra code work kr rha hai !!! )

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//---------------------------------------------------------------------------
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "Shanti Niketan",
//     description: "Your soul needs a peaceful environment..",
//     price: 999,
//     location: "Patna, Boring Road",
//     country: "India",
//   });
//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successfull testing..");
// });

// -----------------------------------------------------------
app.get("/", (req, res) => {
  res.redirect("/listings");
});

//------------------------ Custom/Express Error Handling : ---------------------------------

// app.all("*", (req, res, next) => {
//   next(new expressError(404, "Page Not Found!!"));
// });

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong!!" } = err;
  res.status(statusCode).render("error.ejs", { message }); // expressError
  // res.send("Something Went Wrong!!"); // custom
});

app.listen(8080, () => {
  console.log("server is listening to port 8080 ");
});
