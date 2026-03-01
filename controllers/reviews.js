const Review = require("../models/review.js");
const listing = require("../models/listing.js");

module.exports.createReview=async (req, res) => {

    let foundlisting = await listing.findById(req.params.id);
    // console.log(req.body);
    try {
        let newReview = new Review(req.body.review);
        newReview.author=req.user._id;
        // console.log(newReview);
        foundlisting.reviews.push(newReview);

        await newReview.save();
        await foundlisting.save();
        // console.log("saved");
        req.flash("success","New Review is Added");
        res.redirect(`/listings/${foundlisting._id}`);
    } catch (err) {
        console.log(err);
    }

}

module.exports.deleteReview=async(req,res)=>{
    let {id,reviewID}=req.params;
    await listing.findByIdAndUpdate(id,{$pull:{reviews:reviewID}});
    await Review.findByIdAndDelete(reviewID);
    req.flash("success","Review is Deleted");
    res.redirect(`/listings/${id}`);

}