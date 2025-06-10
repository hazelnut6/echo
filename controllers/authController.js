const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const db = require('../db/pool');


// sign-up
exports.getSignUp = (req, res) => {
    res.render('sign-up', { errors: [], user_data: {} });
};
exports.postSignUp = async (req, res, next) => {
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
};

// log-in
exports.getLogIn = (req ,res) => {
    res.render('log-in', { messages: req.flash('error') });
};

// log-out
exports.getLogOut = (req, res, next) => {
    req.logout((err) => {
        if(err) {
            next(err);
        }

        res.redirect('/');
    });
};

// be-member
exports.getBeMember = (req, res) => {
    res.render('be-member', { title: 'Membership', errors: [] });
};
exports.postBeMember = async(req, res, next) => {
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
};

// be-admin
exports.getBeAdmin = (req, res) => {
    res.render('be-admin', { title: 'Enter as Admin', errors: []  });
};
exports.postBeAdmin = async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.render('be-admin', { errors: errors.array() });
    }

    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;
    if(req.body.passcode !== ADMIN_PASSCODE) {
        res.render('be-admin', { errors: [{ msg: 'Incorrect admin passcode, please try again.' }] });
        return;
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
};