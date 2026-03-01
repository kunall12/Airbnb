if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}
// console.log(process.env);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
//for views(ejs files)
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

//routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter=require("./routes/user.js");

//express-session
const session=require("express-session");
const MongoStore = require('connect-mongo');


const dbUrl=process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch(err => {
        console.log(err);
    })
async function main() {
   await mongoose.connect(dbUrl);
}

//for views(ejs files)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());








const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    secret: process.env.SECRET,
    touchAfter: 24 * 3600,
});

store.on("error",(err)=>{
    console.log("error in mongo session store",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,//Means do not save the session back to the session store if nothing has changed.
    saveUninitialized: false,//Means create a session for every user even if you didn’t store anything inside yet.
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};






app.use(session(sessionOptions));//This line activates session middleware for your entire Express app.
app.use(flash()); 


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})




app.get("/", (req, res) => {
  res.redirect("/listings");
});

//listings routes
app.use("/listings", listingRouter);

//reviews route
//in this ye jo id wala parameter hai wo review folder tk jata hi nhi h app.js me hi reh jata h to parent req me jo id hai usko route krna h to review.js me express.Router({mergeParams:true}) krna pdega
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});



// error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;

    if (res.headersSent) {
        return next(err);   // prevents crash
    }

    res.status(statusCode).render("error.ejs", { message });
});




// app.get("/testlisting", async(req, res) => {
//     let samplelisting=new listing({
//         title:"villa",
//         description:"near GU",
//         price:1000,
//         location:"greater noida, UP",
//         country:"india",
//     });

//     await samplelisting.save();
//     console.log("sample was saved");
//     res.send("testing successful");
// })

app.listen(8000, () => {
    console.log("server is listening");
})

