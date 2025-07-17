// Express Session : Express session ek tarika hai jisse hum web application me ek user ki temporary information ko store kar sakte hain — jaise ki login hone ke baad ka data — taki jab tak user browser band nahi karta ya manually logout nahi karta, tab tak uski identity ya data website me bana rahe.

const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Express Session Middleware:
const sessionOptions = {
  secret: "mysupersecretstring",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions)); // ye use krne k bad ab hmre har request k sth ek session id jakr save ho jayegi in the form of a cookie..

app.use(flash()); // flash ko use krne k liye session ka hona jruri hai!!... flash refers to a temporary message stored on the server side, usually to send short notifications or alerts to the client (browser) that last for only one request-response cycle.

//--------------------- Using res.locals ----------------
// Middleware
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  next();
});

//---------------------- Storing & Using Session Info : ----------------
app.get("/register", (req, res) => {
  let { name = "anonymous" } = req.query;
  req.session.name = name;

  if (name === "anonymous") {
    req.flash("error", "user not registered..");
  } else {
    req.flash("success", "user registered successfully!!"); // req.flash(key, message);
  }

  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  // res.send(`hello, ${req.session.name}`);
  res.render("page.ejs", { name: req.session.name, msg: req.flash("success") });
});

// app.get("/reqcount", (req, res) => {
//   if (req.session.count) {
//     req.session.count++;
//   } else {
//     req.session.count = 1;
//   }
//   res.send(`you sent a request ${req.session.count} times`);
// });

// app.get("/test", (req, res) => {
//   res.send("test successfull....");
// });

app.listen(8080, () => {
  console.log("Listening.....");
});
