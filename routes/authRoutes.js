require('dotenv').config();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../db/pool');
require('../config/passport')(passport);
const { Router } = require('express');
const { isAuthenticated, isNotMember, isNotAdmin } = require('../middleware/authMiddleware');


const authRouter = Router();

// sign-up
authRouter.get('/sign-up', (req, res) => {
    res.render('sign-up', { error: [], user_data: {} });
});
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
    async (req, res, next) => {
        //Validation errors
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.render('sign-up', {
                errors: errors.array(),
                user_data: req.body
            });
        }

        try {
            //Password hashing
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            //Insert users to db
            const result = await db.query(
                'INSERT INTO users (first_name, last_name, username, password, is_member, is_admin) VALUES ($1, $2, $3, $4, FALSE, FALSE) RETURNING *;',
                [req.body.first_name, req.body.last_name, req.body.username, hashedPassword]
            );

            //Log in automatically after sign up
            req.login(result.rows[0], (err) => {
                if(err) { return next(err); }
                res.redirect('/')
            })
        } catch(err) {
            console.error('Error signing up user:', err);
            if(err.code === '23505' && err.detail.includes('username')) {
                return res.render('sign-up', {
                    errors: [{ msg: 'That username is already registered.' }],
                    user_data: req.body
                });
            }

            return next(err);
        }
    }
);

// log-in
authRouter.get('/log-in', (req ,res) => {
    res.render('log-in', { messages: req.flash('error') });
});
authRouter.post('/log-in', 
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/log-in',
        failureMessage: true
    })
);

// log-out
authRouter.get('/log-out', (req, res, next) => {
    req.logout((err) => {
        if(err) {
            next(err);
        }

        res.redirect('/');
    });
});

// be-member
authRouter.get('/be-member', isNotMember, (req, res) => {
    res.render('be-member', { title: 'Membership', errors: [] });
});
authRouter.post('/be-member', isNotMember,
    [
        body('passcode')
            .trim()
            .isLength({ min: 1 }).withMessage('Passcode is required.')
            .escape()
    ],
    async(req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.render('be-member', { errors: errors.array() });
        }

        const MEMBER_PASSCODE = process.env.MEMBER_PASSCODE;
        if(req.body.passcode !== MEMBER_PASSCODE) {
            return res.render('be-member', { errors: [{ msg: 'Incorrect password please try again.' }] });
        }

        //Update is_member status
        try {
            await db.query(
                'UPDATE users SET is_member = TRUE WHERE id = $1;',
                [req.user.id]
            );

            req.login(req.user, (err) => {
                if(err) { return next(err); }
                res.redirect('/');
            });
        } catch(err) {
            console.error('Error updating membership status:', err);
            return next(err);
        }
    }
);

// be-admin
authRouter.get('/be-admin', isNotAdmin, (req, res) => {
    res.render('be-admin', { title: 'Enter as Admin', errors: []  });
});
app.post('/be-admin', isNotAdmin,
    [
        body('passcode')
        .trim()
        .isLength({ min: 1 }).withMessage('Passcode is required.')
        .escape()
    ],
    async(req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.render('be-admin', { errors: errors.array() });
        }

        const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;
        if(req.body.passcode !== ADMIN_PASSCODE) {
            res.render('be-admin', { errors: [{ msg: 'Incorrect admin passcode, please try again.' }] });
        }

        try {
            await db.query(
                'UPDATE users SET is_admin = TRUE WHERE id = $1;',
                [req.user.id]
            );

            req.login(req.user, (err) => {
                if(err) { return next(err); }
                res.redirect('/');
            });
        } catch(err) {
            console.error('Error updating admin status:', err);
            return next(err);
        }
    }
);

module.exports = authRouter;