if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const { campgroundSchema, reviewSchema } = require('./schema.js')
const path = require('path');
const ejsMate = require('ejs-mate')
const Campground = require('./models/campground');
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const userRoutes = require('./routes/users')
const mongoSanitize = require('express-mongo-sanitize');
const mongoStore= require('connect-mongo')
const helmet= require('helmet')
const dbUrl= 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const secret= process.env.SECRET || 'thisshouldbeabettersecret'; 
const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"))
db.once('open', () => {
    console.log('Database Connected');
});
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
// app.use(helmet({contentSecurityPolicy: false}))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig= {
    secret,
    resave:false,
    saveUninitialized:true,
    name:'session',
    cookie:{
        httpOnly:true,
        // secure:true,
        expires: Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    },
    store: mongoStore.create({ mongoUrl:'mongodb://localhost:27017/yelp-camp', touchAfter:24*60*60 })

}
app.use(session(sessionConfig))
// app.use(helmet)
app.use(mongoSanitize())
app.use(passport.initialize())
app.use(passport.session())

// app.use(
//     helmet.contentSecurityPolicy({
//       directives: {
//         "script-src": ["'self'", "example.com"],
//         "style-src": null,
//       },
//     })
//   );
  
//   // Sets "Content-Security-Policy: default-src 'self';script-src 'self' example.com;object-src 'none';upgrade-insecure-requests"
//   app.use(
//     helmet.contentSecurityPolicy({
//       useDefaults: false,
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "example.com"],
//         objectSrc: ["'none'"],
//         upgradeInsecureRequests: [],
//       },
//     })
//   );
  
//   // Sets the "Content-Security-Policy-Report-Only" header instead
//   app.use(
//     helmet.contentSecurityPolicy({
//       directives: {
//         /* ... */
//       },
//       reportOnly: true,
//     })
//   );
  
//   // Sets the `script-src` directive to "'self' 'nonce-e33ccde670f149c1789b1e1e113b0916'" (or similar)
//   app.use((req, res, next) => {
//     res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
//     next();
//   });
//   app.use(
//     helmet.contentSecurityPolicy({
//       directives: {
//         scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
//       },
//     })
//   );
  
//   // Sets "Content-Security-Policy: script-src 'self'"
//   app.use(
//     helmet.contentSecurityPolicy({
//       useDefaults: false,
//       directives: {
//         "default-src": helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
//         "script-src": ["'self'"],
//       },
//     })
//   );
  
//   // Sets the `frame-ancestors` directive to "'none'"
//   // See also: `helmet.frameguard`
//   app.use(
//     helmet.contentSecurityPolicy({
//       directives: {
//         frameAncestors: ["'none'"],
//       },
//     })
//   );
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(flash())
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})


app.use('/campground', campgroundRoutes)
app.use('/campground/:id/reviews', reviewRoutes)
app.use('/', userRoutes)

app.get('/', (req, res) => {
    res.render('home')
})
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})
app.use((err, req, res, next) => {
    const { status = 500, message } = err;
    if (!err.message) err.message = 'Oh boy Something went wrong!'
    res.status(status).render('error', { err })
})
app.listen(3000, () => {
    console.log("Listening on Port 3000");
})

