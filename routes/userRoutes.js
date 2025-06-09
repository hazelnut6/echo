require('dotenv').config();
const db = require('../db/pool');
const { Router } = require('express');


const userRouter = Router();

userRouter.get('/', async (req, res, next) => {
    try {
        const { rows: fetchedMessages } = await db.query(`
                SELECT
                    m.id,
                    m.title,
                    m.text_content,
                    m.timestamp,
                    u.username AS author_username,
                    u.first_name AS author_first_name,
                    u.last_name AS author_last_name
                FROM messages AS m 
                JOIN users AS u ON m.user_id = u.id
                ORDER BY m.timestamp DESC;
            `);

            res.render('index', {
                title: 'Home',
                messages: fetchedMessages,
                flashMessages: {
                    success: req.flash('success'),
                    error: req.flash('error'),
                    validationErrors: req.flash('validationErrors'),
                    oldInput: req.flash('oldInput')[0] || {}
                }
            });
    } catch(err) {
        return next(err);
    }
});

// userRouter.get('/about', (req, res) => {});
// userRouter.get('/contact', (req, res) => {});


module.exports = userRouter;