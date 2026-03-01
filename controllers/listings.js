const listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const { country } = req.query;

    let allListings;

    if (country) {
        allListings = await listing.find({
            country: { $regex: country, $options: "i" }
        });
    } else {
        allListings = await listing.find();
    }

    res.render("listings/index.ejs", {
        allListings,
        country
    });
};


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params
    const list = await listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!list) {
        req.flash("error", "Listing not exist!");
        return res.redirect("/listings");
    }
    // console.log(list);
    res.render("listings/show.ejs", { list });
}

module.exports.createListing = async (req, res) => {
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send();

    // console.log(response.body.features[0].geometry);
    // res.send("done");
    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url);
    // console.log(filename);

    const newlisting = new listing(req.body.listing);
    // if(!newlisting.description){
    //     throw new ExpressError(404,"description is not available")
    // }
    newlisting.owner = req.user._id;//passport sare user related info req.user ke andr save krta h aur uske ande _id hota h jo user ka id store krta h

    newlisting.image = { url, filename };
    newlisting.geometry=response.body.features[0].geometry;
    await newlisting.save();
    req.flash("success", "New Listing is created");
    res.redirect("/listings");
}

module.exports.editForm = async (req, res) => {
    let { id } = req.params
    const list = await listing.findById(id);
    if (!list) {
        req.flash("error", "Listing not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = list.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { list, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let foundListing = await listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {//in js if we have to check the value is undefined or not or something else we use "typeof"
        let url = req.file.path;
        let filename = req.file.filename;
        foundListing.image = { url, filename };
        await foundListing.save();
    }

    req.flash("success", "Listing is Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedlist = await listing.findByIdAndDelete(id);
    // console.log(deletedlist);
    req.flash("success", "Listing is Deleted");
    res.redirect("/listings");
}