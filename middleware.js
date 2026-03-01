const listing=require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
//to validate through joi require the listing schema
const { listingSchema,reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");



module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in!")
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner=async(req,res,next)=>{
    let { id } = req.params;
    let list=await listing.findById(id);
    if(!list.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this list");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body, { abortEarly: false });
    if (error) {
        //to print all errors with separated by comma
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
// console.log("BODY IN VALIDATE:", req.body);  // debug
  const { error } = reviewSchema.validate(req.body, { abortEarly: false });  // ✅ validate whole body
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    return next(new ExpressError(400, msg));
  }
  next();
};


module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id, reviewID } = req.params;
    let review=await Review.findById(reviewID);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}