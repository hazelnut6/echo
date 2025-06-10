const { Router } = require('express');
const userController = require('../controllers/userController');


const userRouter = Router();

userRouter.get('/', userController.getHome);

// userRouter.get('/about', (req, res) => {});
// userRouter.get('/contact', (req, res) => {});


module.exports = userRouter;