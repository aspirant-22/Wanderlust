const Listing = require("../models/listing.js");
const { cloudinary } = require("../cloudConfig.js");

module.exports.index = async (req , res) => {
    let { category, country } = req.query;

    let query = {};

    if (category && category !== "None") {
        query.category = category;
    }

    if (country) {
        query.country = new RegExp(country, "i"); // case-insensitive search
    }

    let allListings = await Listing.find(query);

    res.render("listings/index.ejs", { allListings });

    // let allListings = await Listing.find({});
    // res.render("listings/index.ejs" , {allListings});
}

module.exports.renderNewForm = (req , res) => {
    res.render("listings/new.ejs");
}

module.exports.createListing = async (req , res , next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {
        url: req.file.path,
        filename: req.file.filename
    };
    await newListing.save();
    //req.flash("success" , "New Listing Created");
    req.session.success = "New Listing Created";
    res.redirect("/listings");
}

module.exports.showListing = async (req , res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path : "reviews",
            populate : {
                path : "author",
            }
        })
        .populate("owner");
    if (!listing){
        req.session.error = "Listing you requested for doesn't exists";
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs" , { listing }); 
}

module.exports.renderEditForm = async(req , res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing){
        req.session.error = "Listing you requested for doesn't exists";
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload" , "/upload/h_250,w_250");
    res.render("listings/edit.ejs" , { listing , originalImageUrl});
}

module.exports.updateListing = async (req , res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id , { ...req.body.listing});

    if (typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url , filename};
        await listing.save();
    }
    req.session.success = "Listing Updated successfully";
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req , res) =>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.session.error = "Listing Deleted";
    console.log(deletedListing);
    res.redirect("/listings");
}