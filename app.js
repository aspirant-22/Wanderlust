if (process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const methodOverride = require('method-override');
const initData = require("./init/data.js"); // ./init/data.js -> means current directory ke inside init ke inside data.js present hai

const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema}  = require("./schema.js");

const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js"); //Adding listing.js route
const reviewRouter = require("./routes/review.js"); //Adding review.js route
const userRouter = require("./routes/user.js");

const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const passport = require("passport");
const LocalStrategy = require("passport-local");

const dbUrl = process.env.ATLASDB_URL;

//./ = current directory
//../ = parent directory

app.set("views" , path.join(__dirname , "views"));
app.set("view engine" , "ejs");
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname , "public")));
app.use(express.urlencoded({extended : true})); //V Imp for post route otherwise it won't work
app.engine('ejs', ejsMate);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter : 24 * 3600,
})

store.on("error" , (err) => {
    console.log("ERROR in MONGO SESSION STORE" , err);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true,
  },
}

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Middleware for session using res.locals()
app.use((req , res , next) => {
    // res.locals.successMsg = req.flash("success"); //Since flash is outdated now
    res.locals.success = req.session.success;
    // res.locals.errorMsg = req.flash("error");
    res.locals.error = req.session.error;
    res.locals.currUser = req.user;

    // clear after one use (flash behavior)
    delete req.session.success;
    delete req.session.error;
    next();
})

// app.get("/demouser" , async (req , res) => {
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "delta-student",
//     })

//     let registeredUser = await User.register(fakeUser , "helloworld");
//     res.send(registeredUser);
// })

app.listen(port , (req , res) => {
    console.log(`Server is running at port ${port}`);
})

app.get("/" , (req , res) => {
    res.redirect("/listings");
})

//-------------Code for connecting mongoose with Node.js--------------
const mongoose = require('mongoose');
const { type } = require("os");

main()
    .then(() => {
        console.log("connection successful");
    })
    . catch ((err) => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}
//=======================End of Basic Setup =========================================================

//---------------------Defining Routes------------------------------------------------------

app.use("/listings" , listingRouter); //For Listings
app.use("/listings/:id/reviews" , reviewRouter);//For reviews
app.use("/" , userRouter);//For User

//---------------------------------------------------------------
//Error Handling

app.use((req , res , next) => {
    next(new ExpressError(404 , "Page Not Found!"));
})

app.use((err , req , res , next) => {
    let {statusCode = 500 , message = "Something went wrong"} = err;
    res.status(statusCode).render("error.ejs" , { message });
    //res.status(statusCode).send(message);
})