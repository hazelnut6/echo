const { body } = require('express-validator');
const { Router } = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const msgController = require('../controllers/msgController');


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
    msgController.postCreateMessage
);

// message/:id/delete
msgRouter.post('/message/:id/delete', isAdmin, msgController.postMessageDelete);

module.exports = msgRouter;