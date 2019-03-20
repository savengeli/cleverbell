// User is redirected to login/register page if not logged in
const isUserLoggedIn = (req, resp, next) => {
    if (req.session.userId) {
        next(); 
    } else {
        resp.redirect("/"); 
    }
}

// User is not allowed to go to login/register page if logged in
const redirectHome = (req, resp, next) => {
    if (req.session.userId) {
        resp.redirect("/home")
    } else {
        next();
    }
}

module.exports.isUserLoggedIn = isUserLoggedIn;
module.exports.redirectHome = redirectHome;