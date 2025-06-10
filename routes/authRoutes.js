const passport = require('passport');
const { body } = require('express-validator');
const { Router } = require('express');
const { isNotMember, isNotAdmin } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');


const authRouter = Router();

// sign-up
authRouter.get('/sign-up', authController.getSignUp);
authRouter.post('/sign-up', 
    [
        //Sanitization and validation
        body('first_name')
            .trim()
            .isLength({ min: 1 }).withMessage('First name is required.')
            .escape(),
        body('last_name')
            .trim()
            .isLength({ min: 1 }).withMessage('Last name is required')
            .escape(),
        body('username')
            .trim()
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.')
            .escape(),
        body('password')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
        body('confirm_password').custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Passsowrd confirmation does not match password.');
            }

            return true;
        })
    ],
    authController.postSignUp
);

// log-in
authRouter.get('/log-in', authController.getLogIn);
authRouter.post('/log-in', 
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/log-in',
        failureFlash: true
    })
);

// log-out
authRouter.get('/log-out', authController.getLogOut);

// be-member
authRouter.get('/be-member', isNotMember, authController.getBeMember);
authRouter.post('/be-member', isNotMember,
    [
        body('passcode')
            .trim()
            .isLength({ min: 1 }).withMessage('Passcode is required.')
            .escape()
    ],
    authController.postBeMember
);

// be-admin
authRouter.get('/be-admin', isNotAdmin, authController.getBeAdmin);
authRouter.post('/be-admin', isNotAdmin,
    [
        body('passcode')
        .trim()
        .isLength({ min: 1 }).withMessage('Passcode is required.')
        .escape()
    ],
    authController.postBeAdmin
);

module.exports = authRouter;