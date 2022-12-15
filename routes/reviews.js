const express = require('express')
const router= express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const ExpressError=require('../utils/ExpressError')
const {campgroundSchema,reviewSchema}= require('../schema.js')
const Review= require('../models/review')
const mongoose = require('mongoose')
const Schema=mongoose.Schema;
const {validateReview,isLoggedIn,isReviewAuthor}=require('../middleware')
const {createReview,deleteReview}= require('../controllers/reviews')

router.post('/',isLoggedIn, validateReview ,createReview)
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(deleteReview))
module.exports=router;