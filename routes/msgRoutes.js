require('dotenv').config();
const { body, validationResult } = require('express-validator');
const db = require('../db/pool');
const { Router } = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');


const msgRouter = Router();

// create-message
msgRouter.post('/create-message', isAuthenticated,
    [
        body('title')
            .trim()
            .isLength({ min: 1 }).withMessage('Title is required.')
            .isLength({ max: 255 }).withMessage('Title cannot exceed 255 characters.')
            .escape(),
        body('text_content')  
        .trim()
        .isLength({ min: 1 }).withMessage('Message content is required.')
        .escape()
    ],
    async(req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            req.flash('validationErrors', errors.array());
            req.flash('oldInput', req.body);
            return res.redirect('/');
        }

        try{
            //Insert to db
            const result = await db.query(
                'INSERT INTO messages (title, text_content, user_id) VALUES ($1, $2, $3) RETURNING *;',
                [req.body.title, req.body.text_content, req.user.id]
            );

            req.flash('success', 'Message posted successfully');
            res.redirect('/');
        } catch(err) {
            console.error('Error creating message:', err);
            req.flash('error', 'There was an error creating your message.')
            res.redirect('/');
            return;
            // return next(err);
        }
    }
);

// message/:id/delete
msgRouter.post('/message/:id/delete', isAdmin,
    async(req, res, next) => {
        try {
            const messageId = req.params.id;
            await db.query('DELETE FROM messages WHERE id = $1;', [messageId]);

            //Add success flash mesages
            req.flash('success', 'Message deleted successfully!');
            res.redirect('/');
        } catch(err) {
            console.error('Error deleting message:', err);

            //Add error flash message
            req.flash('error', 'There was an error deleting the message:');
            return next(err);
        }
    }
);

module.exports = msgRouter;