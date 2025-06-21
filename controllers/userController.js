const db = require('../db/pool');


// home
exports.getHome = async (req, res, next) => {
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
};

// about
exports.getAbout = (req, res) => {
    res.render('about', { title: 'About' });
};

// contact
exports.getContact = (req, res) => {
    res.render('contact', { title: 'Contact Us' });
};