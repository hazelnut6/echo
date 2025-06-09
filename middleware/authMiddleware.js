//Check if user is authenticated(create-message)
exports.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Please log in to access this page.');
    res.redirect('/log-in');
}

//Check if user is authenticated AND NOT already a member
exports.isNotMember = (req, res, next) => {
    if(req.isAuthenticated() && !req.user.is_member) {
        return next();
    }
    //if authenticated & member got to home. if not authenticated log in 
    req.flash('error', req.isAuthenticated() ? 'You are already a member.' : 'Please log in to become a member.');
    res.redirect(req.isAuthenticated() ? '/' : '/log-in');
};

//Check if user is authenticated AND NOT already an admin
exports.isNotAdmin = (req, res, next) => {
    if(req.isAuthenticated() && !req.user.is_admin) {
        return next();
    }
    req.flash('error', 'You do not have permission to perform this action.');
    res.redirect(req.isAuthenticated() ? '/': '/log-in');
};

//Check if user is authenticated AND is AN ADMIN
exports.isAdmin = (req, res, next) => {
    if(req.isAuthenticated && req.user.is_admin) {
        return next();
    }
    res.redirect('/');
}