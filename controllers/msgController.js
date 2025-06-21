const { validationResult } = require('express-validator');
const db = require('../db/pool');


// create-message
exports.postCreateMessage = async(req, res, next) => {
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

        req.flash('success', 'Message posted successfully!');
        res.redirect('/');
    } catch(err) {
        console.error('Error creating message:', err);
        req.flash('error', 'There was an error creating your message.')
        res.redirect('/');
        return;
    }
};

// message/:id/delete
exports.postMessageDelete = async(req, res, next) => {
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
        res.redirect('/');
        return;
    }
};