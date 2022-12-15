const express= require('express')
const router= express.Router(); 
const Campground = require('../models/campground');
const {campgroundSchema,reviewSchema}= require('../schema.js')
const catchAsync= require('../utils/catchAsync')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder= mbxGeocoding({ accessToken: mapBoxToken })
const {storage}= require('../cloudinary')
const multer= require('multer')
const upload= multer({storage});
const {isLoggedIn,isAuthor,validateCampground}= require('../middleware.js')
const {index,renderNewForm,createCamground,deleteCampground,showCampground,renderEditForm,updateCampground}= require('../controllers/campgrounds')

router.route('/')
   .get(catchAsync(index))
   .post(isLoggedIn,upload.array('image'),validateCampground,async(req,res)=>{
    const geoData= await geocoder.forwardGeocode({query:req.body.campground.location, limit:1}).send()
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground)
    campground.geometry=geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;
    await campground.save()
    console.log(campground)
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campground/${campground.id}`)
   })


router.get('/new',isLoggedIn, renderNewForm)

router.route('/:id')
   .get(catchAsync(showCampground))
   .put(isLoggedIn,isAuthor,upload.array('image'),validateCampground, catchAsync(updateCampground))
   .delete(isLoggedIn,isAuthor,catchAsync(deleteCampground))
router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(renderEditForm))
module.exports=router;