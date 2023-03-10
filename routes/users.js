const express= require('express')
const router= express.Router();
const User = require('../models/user')
const catchAsync= require('../utils/catchAsync')
const passport= require('passport')
const {renderRegister, register,renderLogin,login,logout}= require('../controllers/users')

router.route('/register')
    .get(renderRegister)
    .post(catchAsync(register))

router.route('/login')
    .get(renderLogin)
    .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),login)

router.get('/logout',logout)
module.exports=router;
 