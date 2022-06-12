const express               =  require('express'),
      app                   =  express(),
      mongoose              =  require("mongoose"),
      passport              =  require("passport"),
      bodyParser            =  require("body-parser"),
      LocalStrategy         =  require("passport-local"),
      passportLocalMongoose =  require("passport-local-mongoose"),
      session               =  require("express-session"),
      User                  =  require("./server/authentication/models/user");

      dotenv                =  require('dotenv').config()

require('dotenv').config()
//Connecting database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology:true
});

app.use(session({
    secret:"Any normal Word",       //decode or encode session
    resave: false,          
    saveUninitialized:false,
    cookie:{
        maxAge: 2*60*1000 
    }    
}));

passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded(
      { extended:true }
))
app.use(passport.initialize());
app.use(passport.session());

//current User
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})

//=======================
//      R O U T E S
//=======================

app.get("/", (req, res) => {
    res.render("home");
})

app.get("/profile", isLoggedIn, (req, res) => {
    res.render("profile");
})
//Auth Routes
//Login
app.get("/login",(req, res) => {
    res.render("login");
});

app.post("/login",passport.authenticate("local", {
    successRedirect:"/profile",
    failureRedirect:"/login"
}), function (req, res) {

});

//SignUp
app.get("/signup",(req, res) => {
    res.render("signup");
});

app.post("/signup",(req, res) => {
    
    User.signup(new User({username: req.body.username, phone:req.body.phone, telephone: req.body.telephone}), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.render("signup");
        }
    passport.authenticate("local")(req, res, function() {
        res.redirect("/login");
    })    
    })
});

//logout
app.get("/logout",(req, res) => {
    req.logout();
    res.redirect("/");
});

//MIDDLEWARE
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT || 3000, function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Server Started At Port 3000");
    }     
});