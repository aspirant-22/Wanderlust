const User = require("../models/user.js");
const passport = require("passport");

module.exports.renderSignupForm = (req , res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async(req , res) => {
    try {
        let {username , email , password} = req.body;
        const newUser = new User({email , username});
        const registeredUser = await User.register(newUser , password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) { 
                return next(err); 
            }
            req.session.success = "Welcome to Wanderlust";
            res.redirect("/listings");
        });
    } catch (e) {
        req.session.error = e.message;
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req , res) => {
    res.render("users/login.ejs");
}

module.exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);

        // ❌ Login failed
        if (!user) {
            req.session.error = info?.message || "Invalid username or password";
            return res.redirect('/login');
        }

        // ✅ Login success
        req.logIn(user, (err) => {
            if (err) return next(err);

            req.session.success = "Welcome back!";
            return res.redirect('/listings');
        });

    })(req, res, next);
};

module.exports.logout = (req , res , next) => {
    req.logout((err) => {
        if (err){
            return next(err);
        }
        req.session.success = "You are logged out!";
        res.redirect("/listings");
    })
}